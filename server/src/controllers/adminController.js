import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { AuditLog } from '../models/misc.js';

const LOW_THRESHOLD = 5;

// ---------- Inventory ----------
// GET /api/admin/inventory?search=&status=all|in|low|out
export const inventory = asyncHandler(async (req, res) => {
  const { search = '', status = 'all' } = req.query;
  const products = await Product.find();

  let rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p._id,
      productName: p.name,
      productSlug: p.slug,
      image: p.images?.[0] || v.images?.[0] || null,
      category: p.category?.name,
      productActive: p.isActive,
      sku: v.sku,
      sizeLabel: v.sizeLabel,
      price: v.price,
      stock: v.stockQuantity,
    }))
  );

  const stats = {
    totalSkus: rows.length,
    outOfStock: rows.filter((r) => r.stock === 0).length,
    lowStock: rows.filter((r) => r.stock > 0 && r.stock <= LOW_THRESHOLD).length,
    inStock: rows.filter((r) => r.stock > LOW_THRESHOLD).length,
    totalStockValue: rows.reduce((s, r) => s + r.price * r.stock, 0),
  };

  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => r.productName.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s));
  }
  if (status === 'out') rows = rows.filter((r) => r.stock === 0);
  else if (status === 'low') rows = rows.filter((r) => r.stock > 0 && r.stock <= LOW_THRESHOLD);
  else if (status === 'in') rows = rows.filter((r) => r.stock > LOW_THRESHOLD);

  rows.sort((a, b) => a.stock - b.stock || a.productName.localeCompare(b.productName));
  res.json({ rows, stats, lowThreshold: LOW_THRESHOLD });
});

// PUT /api/admin/inventory/stock  { productId, sku, quantity }
export const updateStock = asyncHandler(async (req, res) => {
  let { productId, sku, quantity } = req.body;
  quantity = Math.max(0, Number(quantity));
  const r = await Product.updateOne(
    { _id: productId, 'variants.sku': sku },
    { $set: { 'variants.$.stockQuantity': quantity } }
  );
  if (!r.matchedCount) return res.status(404).json({ message: 'Không tìm thấy biến thể' });
  const stockStatus = quantity === 0 ? 'out' : quantity <= LOW_THRESHOLD ? 'low' : 'in';
  res.json({ quantity, status: stockStatus });
});

// ---------- Report ----------
// GET /api/admin/report?from=&to=&groupBy=day|month
export const report = asyncHandler(async (req, res) => {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 29 * 86400000);
  const groupBy = req.query.groupBy === 'month' ? 'month' : 'day';

  const orders = await Order.find({
    createdAt: { $gte: from, $lte: to },
    orderStatus: { $ne: 'cancelled' },
  });

  const buckets = {};
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const key = groupBy === 'month'
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : d.toISOString().slice(0, 10);
    if (!buckets[key]) buckets[key] = { label: key, revenue: 0, orders: 0 };
    buckets[key].revenue += o.pricing?.totalAmount || 0;
    buckets[key].orders += 1;
  }
  const data = Object.values(buckets).sort((a, b) => a.label.localeCompare(b.label));

  // top products in range
  const sales = {};
  for (const o of orders) {
    for (const it of o.items || []) {
      const k = it.productName;
      if (!sales[k]) sales[k] = { name: k, quantity: 0, revenue: 0 };
      sales[k].quantity += it.quantity;
      sales[k].revenue += it.price * it.quantity;
    }
  }
  const topProducts = Object.values(sales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

  res.json({
    from, to, groupBy, data, topProducts,
    totalRevenue: data.reduce((s, d) => s + d.revenue, 0),
    totalOrders: orders.length,
  });
});

// ---------- Audit log ----------
// GET /api/admin/audit-logs?page=&limit=
export const auditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Number(req.query.limit || 30);
  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    AuditLog.countDocuments(),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});
