import mongoose from 'mongoose';

// --- AuditLog ---
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, default: '' },
  collectionName: { type: String, default: '' },
  documentId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'AuditLogs' });
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// --- PageView ---
const pageViewSchema = new mongoose.Schema({
  path: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userId: String,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'PageViews' });
export const PageView = mongoose.model('PageView', pageViewSchema);

// --- LoyaltyPointHistory ---
const loyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0 },
  type: { type: String, default: 'earn' }, // earn | redeem
  description: { type: String, default: '' },
  orderId: String,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'LoyaltyPointHistory' });
export const LoyaltyPointHistory = mongoose.model('LoyaltyPointHistory', loyaltySchema);

// --- ReturnRequest ---
const returnItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantSku: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
}, { _id: false });
const returnRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: { type: [returnItemSchema], default: [] },
  reason: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  refundAmount: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  adminNote: String,
}, { timestamps: true, collection: 'ReturnRequests' });
export const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);

// --- Newsletter subscriber ---
const newsletterSchema = new mongoose.Schema({
  email: { type: String, default: '', index: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'Newsletter' });
export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSchema);
