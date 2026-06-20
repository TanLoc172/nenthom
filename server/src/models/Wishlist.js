import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantSku: String,
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  items: { type: [wishlistItemSchema], default: [] },
}, { timestamps: { createdAt: false, updatedAt: true }, collection: 'Wishlists' });

export default mongoose.model('Wishlist', wishlistSchema);
