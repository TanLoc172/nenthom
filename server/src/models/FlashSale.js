import mongoose from 'mongoose';

const flashSaleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, default: '' },
  slug: String,
  imageUrl: String,
  originalPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  saleQuantity: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
}, { _id: false });

flashSaleItemSchema.virtual('discountPercent').get(function () {
  return this.originalPrice > 0
    ? Math.round((1 - this.salePrice / this.originalPrice) * 100)
    : 0;
});

const flashSaleSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: String,
  startTime: Date,
  endTime: Date,
  items: { type: [flashSaleItemSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'FlashSales', toJSON: { virtuals: true } });

flashSaleSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.startTime) return 'scheduled';
  if (now > this.endTime) return 'ended';
  return 'active';
});

export default mongoose.model('FlashSale', flashSaleSchema);
