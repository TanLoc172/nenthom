import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
}, { _id: false });

const shippingZoneSchema = new mongoose.Schema({
  province: { type: String, default: '' },
  fee: { type: Number, default: 0 },
  estimatedDays: { type: Number, default: 0 },
}, { _id: false });

const seoSchema = new mongoose.Schema({
  defaultTitle: { type: String, default: '' },
  defaultDescription: { type: String, default: '' },
  googleAnalyticsId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
}, { _id: false });

const siteSettingSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  siteName: { type: String, default: 'Nến Thơm ABC' },
  logoUrl: { type: String, default: '' },
  faviconUrl: String,
  contact: { type: contactSchema, default: () => ({}) },
  defaultShippingFee: { type: Number, default: 2000 },
  shippingZones: { type: [shippingZoneSchema], default: [] },
  seo: { type: seoSchema, default: () => ({}) },
}, { timestamps: { createdAt: false, updatedAt: true }, collection: 'SiteSettings', _id: false });

export default mongoose.model('SiteSetting', siteSettingSchema);
