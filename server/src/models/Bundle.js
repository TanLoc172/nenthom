import mongoose from 'mongoose';

const companionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, default: '' },
  slug: String,
  imageUrl: String,
}, { _id: false });

const bundleSchema = new mongoose.Schema({
  mainProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  mainProductName: { type: String, default: '' },
  companions: { type: [companionSchema], default: [] },
  discountPercent: { type: Number, default: 10, min: 1, max: 80 },
  label: { type: String, default: 'Mua kèm tiết kiệm' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'Bundles' });

bundleSchema.index({ mainProductId: 1 });

export default mongoose.model('Bundle', bundleSchema);
