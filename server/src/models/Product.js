import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, default: '' },
  sizeLabel: { type: String, default: '' },
  weightGrams: { type: Number, default: 0 },
  dimensions: String,
  price: { type: Number, default: 0 },
  compareAtPrice: Number,
  stockQuantity: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const categoryRefSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, default: '' },
  slug: { type: String, default: '' },
}, { _id: false });

const candleAttributesSchema = new mongoose.Schema({
  waxType: String,
  wickType: String,
  burnTimeHours: Number,
  weightGrams: Number,
  origin: String,
}, { _id: false });

const scentNotesSchema = new mongoose.Schema({
  top: { type: [String], default: [] },
  middle: { type: [String], default: [] },
  base: { type: [String], default: [] },
}, { _id: false });

const scentProfileSchema = new mongoose.Schema({
  scentName: { type: String, default: '' },
  intensity: { type: Number, default: 5 },
  notes: { type: scentNotesSchema, default: () => ({}) },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  slug: { type: String, default: '', index: true },
  description: { type: String, default: '' },
  shortDescription: String,
  category: { type: categoryRefSchema, default: () => ({}) },
  tags: { type: [String], default: [] },
  candleAttributes: candleAttributesSchema,
  scentProfile: { type: scentProfileSchema, default: () => ({}) },
  variants: { type: [variantSchema], default: [] },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
}, { timestamps: true, collection: 'Products' });

export default mongoose.model('Product', productSchema);
