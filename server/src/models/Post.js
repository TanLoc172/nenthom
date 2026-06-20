import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  slug: { type: String, default: '', index: true },
  excerpt: String,
  content: { type: String, default: '' },
  thumbnailUrl: String,
  category: String,
  tags: { type: [String], default: [] },
  status: { type: String, default: 'draft' }, // draft | published
  authorName: String,
  publishedAt: Date,
  viewCount: { type: Number, default: 0 },
}, { timestamps: true, collection: 'Posts' });

export default mongoose.model('Post', postSchema);
