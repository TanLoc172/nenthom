import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// GET /api/products/:productId/reviews  (approved only)
export const productReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId, status: 'approved' })
    .sort({ createdAt: -1 });
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  res.json({ reviews, average: Math.round(avg * 10) / 10, count: reviews.length });
});

// POST /api/products/:productId/reviews  (auth)
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images } = req.body;
  const productId = req.params.productId;
  // verified purchase?
  const purchased = await Order.exists({
    userId: req.user.id,
    'items.productId': productId,
    orderStatus: { $in: ['completed', 'delivered', 'paid'] },
  });
  const review = await Review.create({
    userId: req.user.id,
    productId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: !!purchased,
    status: 'pending',
  });
  res.status(201).json(review);
});

// ----- Admin -----
export const adminListReviews = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const reviews = await Review.find(filter).sort({ createdAt: -1 })
    .populate('productId', 'name slug images')
    .populate('userId', 'profile email');
  const counts = await Review.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  const statusCounts = {};
  for (const c of counts) statusCounts[c._id] = c.n;
  res.json({ items: reviews, statusCounts });
});
export const moderateReview = asyncHandler(async (req, res) => {
  const r = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!r) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(r);
});
export const deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});
