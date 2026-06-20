import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantSku: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionToken: { type: String, default: null },
  items: { type: [cartItemSchema], default: [] },
}, { timestamps: true, collection: 'Carts' });

export default mongoose.model('Cart', cartSchema);
