import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

// Compute discount for a given coupon + subtotal. Returns { valid, discount, message }.
export function applyCoupon(coupon, subtotal) {
  if (!coupon || !coupon.isActive) return { valid: false, discount: 0, message: 'Mã không hợp lệ' };
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) return { valid: false, discount: 0, message: 'Mã chưa có hiệu lực' };
  if (coupon.endDate && now > coupon.endDate) return { valid: false, discount: 0, message: 'Mã đã hết hạn' };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, discount: 0, message: 'Mã đã hết lượt sử dụng' };
  if (subtotal < (coupon.minOrderValue || 0))
    return { valid: false, discount: 0, message: `Đơn tối thiểu ${coupon.minOrderValue}` };

  let discount =
    coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  if (coupon.maxDiscountAmount != null) discount = Math.min(discount, coupon.maxDiscountAmount);
  discount = Math.min(discount, subtotal);
  return { valid: true, discount: Math.round(discount), message: 'Áp dụng thành công' };
}

// POST /api/coupons/validate  { code, subtotal }
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: code?.trim().toUpperCase() });
  const result = applyCoupon(coupon, Number(subtotal));
  if (!result.valid) return res.status(400).json(result);
  res.json({ ...result, code: coupon.code, couponId: coupon._id });
});

// ----- Admin -----
export const listCoupons = asyncHandler(async (_req, res) => {
  res.json(await Coupon.find().sort({ createdAt: -1 }));
});
export const createCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code?.trim().toUpperCase();
  if (await Coupon.findOne({ code })) return res.status(409).json({ message: 'Mã đã tồn tại' });
  res.status(201).json(await Coupon.create({ ...req.body, code }));
});
export const updateCoupon = asyncHandler(async (req, res) => {
  const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(c);
});
export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});
