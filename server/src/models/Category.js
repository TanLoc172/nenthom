import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, default: '' },
  slug: { type: String, default: '', index: true },
  description: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  imageUrl: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'Categories' });

export default mongoose.model('Category', categorySchema);
