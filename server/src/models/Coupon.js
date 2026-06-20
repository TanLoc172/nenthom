import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, default: '', index: true },
  discountType: { type: String, default: 'fixed_amount' }, // fixed_amount | percentage
  discountValue: { type: Number, default: 0 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscountAmount: Number,
  startDate: Date,
  endDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'Coupons' });

export default mongoose.model('Coupon', couponSchema);
