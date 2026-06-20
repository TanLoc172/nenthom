import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { uniqueSlug } from '../utils/slug.js';

function buildTree(categories, parentId = null) {
  return categories
    .filter((c) => String(c.parentId || '') === String(parentId || ''))
    .map((c) => ({ ...c.toObject(), children: buildTree(categories, c._id) }));
}

// GET /api/categories  (flat active list)
export const listCategories = asyncHandler(async (_req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(cats);
});

// GET /api/categories/tree
export const categoryTree = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const cats = await Category.find(filter).sort({ name: 1 });
  res.json(buildTree(cats));
});

// GET /api/categories/:slug  (with its products)
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  const products = await Product.find({
    'category.categoryId': category._id,
    isActive: true,
  }).sort({ createdAt: -1 });
  res.json({ category, products });
});

// ----- Admin -----
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
  const slug = await uniqueSlug(req.body.slug || name, async (s) => !!(await Category.findOne({ slug: s })));
  const cat = await Category.create({ ...req.body, slug });
  res.status(201).json(cat);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  res.json(cat);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const hasChildren = await Category.exists({ parentId: req.params.id });
  if (hasChildren) return res.status(400).json({ message: 'Danh mục còn danh mục con' });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});
