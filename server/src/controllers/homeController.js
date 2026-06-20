import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import FlashSale from '../models/FlashSale.js';
import Banner from '../models/Banner.js';
import Post from '../models/Post.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// GET /api/home — aggregate everything the homepage needs in one call.
export const home = asyncHandler(async (_req, res) => {
  const now = new Date();

  const [banners, categories, flashSale, featured, newProducts, latestPosts, reviews] = await Promise.all([
    Banner.find({ isActive: true, position: 'homepage', $or: [{ endDate: null }, { endDate: { $gte: now } }] }).sort({ displayOrder: 1 }),
    Category.find({ isActive: true }).sort({ name: 1 }).limit(7),
    FlashSale.findOne({ isActive: true, startTime: { $lte: now }, endTime: { $gte: now } }),
    Product.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(8),
    Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8),
    Post.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3),
    Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(8)
      .populate('userId', 'profile email').populate('productId', 'name slug'),
  ]);

  // Best sellers from orders
  let bestSellers = [];
  const agg = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', qty: { $sum: '$items.quantity' } } },
    { $sort: { qty: -1 } },
    { $limit: 8 },
  ]);
  if (agg.length) {
    const ids = agg.map((a) => a._id).filter(Boolean);
    const prods = await Product.find({ _id: { $in: ids }, isActive: true });
    const map = new Map(prods.map((p) => [String(p._id), p]));
    bestSellers = agg.map((a) => map.get(String(a._id))).filter(Boolean);
  }
  if (bestSellers.length === 0) bestSellers = featured.length ? featured : newProducts;

  const testimonials = reviews
    .filter((r) => r.comment)
    .slice(0, 4)
    .map((r) => ({
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      reviewerName: [r.userId?.profile?.firstName, r.userId?.profile?.lastName].filter(Boolean).join(' ')
        || r.userId?.email?.split('@')[0] || 'Khách hàng',
      productName: r.productId?.name || '',
      isVerifiedPurchase: r.isVerifiedPurchase,
    }));

  res.json({ banners, categories, flashSale, featured, newProducts, bestSellers, testimonials, latestPosts });
});
