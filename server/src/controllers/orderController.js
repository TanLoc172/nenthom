import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import SiteSetting from '../models/SiteSetting.js';
import { LoyaltyPointHistory } from '../models/misc.js';
import User from '../models/User.js';
import { getOrCreateCart, expandCart } from './cartController.js';
import { applyCoupon } from './couponController.js';
import { sendOrderConfirmation } from '../utils/email.js';

function genOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `ES${ymd}${Math.floor(1000 + Math.random() * 9000)}`;
}

async function shippingFeeFor(province) {
  const settings = await SiteSetting.findById('global');
  if (!settings) return 30000;
  const zone = settings.shippingZones?.find((z) => z.province === province);
  return zone ? zone.fee : settings.defaultShippingFee;
}

// POST /api/checkout  { shipping, paymentMethod, couponCode, notes, guestEmail }
export const checkout = asyncHandler(async (req, res) => {
  const { shipping, paymentMethod = 'COD', couponCode, notes, guestEmail } = req.body;
  if (!shipping?.recipientName || !shipping?.recipientPhone || !shipping?.address)
    return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });

  const cartDoc = await getOrCreateCart(req, res);
  const cart = await expandCart(cartDoc);
  if (!cart.items.length) return res.status(400).json({ message: 'Giỏ hàng trống' });

  // Stock check
  for (const it of cart.items) {
    if (it.quantity > it.stockQuantity)
      return res.status(400).json({ message: `${it.name} không đủ hàng` });
  }

  const subtotal = cart.subtotal;

  // Coupon
  let couponUsed = null;
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
    const r = applyCoupon(coupon, subtotal);
    if (!r.valid) return res.status(400).json({ message: r.message });
    discountAmount = r.discount;
    couponUsed = { couponId: coupon._id, code: coupon.code, discountValue: r.discount };
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  }

  const shippingFee = await shippingFeeFor(shipping.province);
  const totalAmount = subtotal - discountAmount + shippingFee;

  const order = await Order.create({
    orderNumber: genOrderNumber(),
    userId: req.user?.id || null,
    guestEmail: req.user ? null : guestEmail,
    items: cart.items.map((i) => ({
      productId: i.productId,
      variantSku: i.variantSku,
      productName: i.name,
      sizeLabel: i.sizeLabel,
      scentName: i.scentName,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.image,
    })),
    pricing: { subtotal, discountAmount, shippingFee, taxAmount: 0, totalAmount },
    couponUsed,
    orderStatus: 'pending',
    payment: { method: paymentMethod, status: 'unpaid' },
    shipping,
    statusHistory: [{ status: 'pending', comment: 'Đơn hàng được tạo' }],
    notes,
  });

  // Decrement stock
  for (const it of cart.items) {
    await Product.updateOne(
      { _id: it.productId, 'variants.sku': it.variantSku },
      { $inc: { 'variants.$.stockQuantity': -it.quantity } }
    );
  }

  // Loyalty points (1 point / 1000đ) for logged-in users
  if (req.user) {
    const pts = Math.floor(totalAmount / 1000);
    if (pts > 0) {
      await User.updateOne({ _id: req.user.id }, { $inc: { 'profile.loyaltyPoints': pts } });
      await LoyaltyPointHistory.create({
        userId: req.user.id, points: pts, type: 'earn',
        description: `Đơn ${order.orderNumber}`, orderId: order._id.toString(),
      });
    }
  }

  // Clear cart
  cartDoc.items = [];
  await cartDoc.save();

  // Send confirmation email (no-op log if SMTP not configured)
  const email = req.user?.email || guestEmail;
  if (email) sendOrderConfirmation(email, order.orderNumber, totalAmount).catch(() => {});

  res.status(201).json(order);
});

// GET /api/orders  (current user's orders)
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (req.user && order.userId && String(order.userId) !== req.user.id && !req.user.roles.includes('admin'))
    return res.status(403).json({ message: 'Không có quyền' });
  res.json(order);
});

// ----- Admin -----
export const adminListOrders = asyncHandler(async (req, res) => {
  const { status, q, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'shipping.recipientName': { $regex: q, $options: 'i' } },
      { 'shipping.recipientPhone': { $regex: q, $options: 'i' } },
    ];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); filter.createdAt.$lte = d; }
  }
  const pageNum = Math.max(1, Number(page));
  const lim = Number(limit);

  const [items, total, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: '$orderStatus', n: { $sum: 1 } } }]),
  ]);

  const statusCounts = {};
  let totalAll = 0;
  for (const c of counts) { statusCounts[c._id] = c.n; totalAll += c.n; }

  res.json({ items, total, page: pageNum, totalPages: Math.ceil(total / lim), statusCounts, totalAll });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, comment, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (status && status !== order.orderStatus) {
    order.orderStatus = status;
    order.statusHistory.push({ status, updatedBy: req.user.id, comment });
  }
  if (paymentStatus) {
    order.payment.status = paymentStatus;
    if (paymentStatus === 'paid' && !order.payment.paidAt) order.payment.paidAt = new Date();
  }
  await order.save();
  res.json(order);
});
