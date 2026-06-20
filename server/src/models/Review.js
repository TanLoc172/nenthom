import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  rating: { type: Number, default: 0 },
  title: String,
  comment: String,
  images: { type: [String], default: [] },
  isVerifiedPurchase: { type: Boolean, default: false },
  status: { type: String, default: 'pending' }, // pending | approved | rejected
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'Reviews' });

export default mongoose.model('Review', reviewSchema);
