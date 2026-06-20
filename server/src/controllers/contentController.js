import asyncHandler from 'express-async-handler';
import Banner from '../models/Banner.js';
import Post from '../models/Post.js';
import FlashSale from '../models/FlashSale.js';
import SiteSetting from '../models/SiteSetting.js';
import { NewsletterSubscriber } from '../models/misc.js';
import { uniqueSlug } from '../utils/slug.js';

// ---------- Banners ----------
export const activeBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    position: req.query.position || 'homepage',
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  }).sort({ displayOrder: 1 });
  res.json(banners);
});
export const adminListBanners = asyncHandler(async (_req, res) => res.json(await Banner.find().sort({ displayOrder: 1 })));
export const createBanner = asyncHandler(async (req, res) => res.status(201).json(await Banner.create(req.body)));
export const updateBanner = asyncHandler(async (req, res) => {
  const b = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!b) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(b);
});
export const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});

// ---------- Blog posts ----------
export const listPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, category } = req.query;
  const filter = { status: 'published' };
  if (category) filter.category = category;
  const pageNum = Math.max(1, Number(page));
  const lim = Number(limit);
  const [items, total] = await Promise.all([
    Post.find(filter).sort({ publishedAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
    Post.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, totalPages: Math.ceil(total / lim) });
});
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
  res.json(post);
});
export const adminListPosts = asyncHandler(async (_req, res) => res.json(await Post.find().sort({ createdAt: -1 })));
export const createPost = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.slug || req.body.title, async (s) => !!(await Post.findOne({ slug: s })));
  const post = await Post.create({
    ...req.body,
    slug,
    publishedAt: req.body.status === 'published' ? new Date() : null,
  });
  res.status(201).json(post);
});
export const updatePost = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.status === 'published') {
    const existing = await Post.findById(req.params.id);
    if (existing && !existing.publishedAt) body.publishedAt = new Date();
  }
  const post = await Post.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!post) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(post);
});
export const deletePost = asyncHandler(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});

// ---------- Flash sales ----------
export const activeFlashSale = asyncHandler(async (_req, res) => {
  const now = new Date();
  const sale = await FlashSale.findOne({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  });
  res.json(sale);
});
export const adminListFlashSales = asyncHandler(async (_req, res) => res.json(await FlashSale.find().sort({ startTime: -1 })));
export const createFlashSale = asyncHandler(async (req, res) => res.status(201).json(await FlashSale.create(req.body)));
export const updateFlashSale = asyncHandler(async (req, res) => {
  const f = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!f) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(f);
});
export const deleteFlashSale = asyncHandler(async (req, res) => {
  await FlashSale.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});

// ---------- Site settings ----------
export const getSettings = asyncHandler(async (_req, res) => {
  let s = await SiteSetting.findById('global');
  if (!s) s = await SiteSetting.create({ _id: 'global' });
  res.json(s);
});
export const updateSettings = asyncHandler(async (req, res) => {
  const s = await SiteSetting.findByIdAndUpdate('global', req.body, { new: true, upsert: true });
  res.json(s);
});

// ---------- Newsletter ----------
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  let { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ message: 'Email không hợp lệ' });
  email = email.trim().toLowerCase();
  const existed = await NewsletterSubscriber.findOne({ email });
  if (!existed) await NewsletterSubscriber.create({ email, isActive: true });
  res.json({
    success: true,
    code: 'WELCOME10',
    message: existed
      ? 'Bạn đã đăng ký trước đó. Dùng mã WELCOME10 để được giảm 10%.'
      : 'Cảm ơn bạn! Dùng mã WELCOME10 để được giảm 10% cho đơn đầu tiên.',
  });
});
