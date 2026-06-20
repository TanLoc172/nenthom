import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { uniqueSlug } from '../utils/slug.js';

// GET /api/products  (public listing with filters, search, pagination, sort)
export const listProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,        // category slug or id
    minPrice,
    maxPrice,
    tag,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (category) {
    filter.$or = filter.$or || [];
    filter.$and = [
      { $or: [{ 'category.slug': category }, { 'category.categoryId': isObjectId(category) ? category : undefined }] },
    ].filter(Boolean);
  }
  if (tag) filter.tags = tag;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter['variants.price'] = {};
    if (minPrice) filter['variants.price'].$gte = Number(minPrice);
    if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    price_asc: { 'variants.0.price': 1 },
    price_desc: { 'variants.0.price': -1 },
  };

  const pageNum = Math.max(1, Number(page));
  const lim = Math.min(60, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip((pageNum - 1) * lim).limit(lim),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, limit: lim, totalPages: Math.ceil(total / lim) });
});

function isObjectId(v) {
  return /^[0-9a-fA-F]{24}$/.test(v || '');
}

// GET /api/products/featured
export const featuredProducts = asyncHandler(async (_req, res) => {
  const items = await Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(8);
  res.json(items);
});

// GET /api/products/:slug  (public detail by slug)
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  // related products (same category)
  const related = await Product.find({
    _id: { $ne: product._id },
    'category.categoryId': product.category?.categoryId,
    isActive: true,
  }).limit(4);

  res.json({ product, related });
});

// ----- Admin -----

// GET /api/admin/products
export const adminListProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  const pageNum = Math.max(1, Number(page));
  const lim = Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, totalPages: Math.ceil(total / lim) });
});

// GET /api/admin/products/:id
export const adminGetProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(product);
});

// POST /api/admin/products
export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body.name) return res.status(400).json({ message: 'Tên sản phẩm là bắt buộc' });

  const cat = body.category?.categoryId
    ? await Category.findById(body.category.categoryId)
    : null;

  const slug = await uniqueSlug(body.slug || body.name, async (s) => !!(await Product.findOne({ slug: s })));

  const product = await Product.create({
    ...body,
    slug,
    category: cat
      ? { categoryId: cat._id, name: cat.name, slug: cat.slug }
      : body.category,
  });
  res.status(201).json(product);
});

// PUT /api/admin/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.category?.categoryId) {
    const cat = await Category.findById(body.category.categoryId);
    if (cat) body.category = { categoryId: cat._id, name: cat.name, slug: cat.slug };
  }
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(product);
});

// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const r = await Product.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json({ message: 'Đã xoá' });
});
