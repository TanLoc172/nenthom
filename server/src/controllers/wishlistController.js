import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wl = await Wishlist.findOne({ userId: req.user.id });
  if (!wl) return res.json({ items: [] });
  const products = await Product.find({ _id: { $in: wl.items.map((i) => i.productId) } });
  res.json({ items: products });
});

// POST /api/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let wl = await Wishlist.findOne({ userId: req.user.id });
  if (!wl) wl = await Wishlist.create({ userId: req.user.id, items: [] });
  if (!wl.items.some((i) => String(i.productId) === productId)) {
    wl.items.push({ productId });
    await wl.save();
  }
  res.json({ message: 'Đã thêm vào yêu thích' });
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await Wishlist.updateOne(
    { userId: req.user.id },
    { $pull: { items: { productId } } }
  );
  res.json({ message: 'Đã xoá' });
});
