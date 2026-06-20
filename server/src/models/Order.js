import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantSku: { type: String, default: '' },
  productName: { type: String, default: '' },
  sizeLabel: { type: String, default: '' },
  scentName: String,
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  imageUrl: String,
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, { _id: false });

const couponUsageSchema = new mongoose.Schema({
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  code: String,
  discountValue: Number,
}, { _id: false });

const paymentInfoSchema = new mongoose.Schema({
  method: { type: String, default: 'COD' },
  status: { type: String, default: 'unpaid' },
  transactionId: String,
  paidAt: Date,
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
  recipientName: { type: String, default: '' },
  recipientPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  carrier: String,
  trackingNumber: String,
  estimatedDelivery: Date,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  items: { type: [orderItemSchema], default: [] },
  pricing: { type: pricingSchema, default: () => ({}) },
  couponUsed: couponUsageSchema,
  orderStatus: { type: String, default: 'pending' },
  payment: { type: paymentInfoSchema, default: () => ({}) },
  shipping: { type: shippingInfoSchema, default: () => ({}) },
  statusHistory: { type: [statusHistorySchema], default: [] },
  notes: String,
}, { timestamps: true, collection: 'Orders' });

export default mongoose.model('Order', orderSchema);
