import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: String,
  mediaType: { type: String, default: 'image' }, // image | video
  imageUrl: { type: String, default: '' },
  mobileImageUrl: String,
  videoUrl: String,
  videoPoster: String,
  linkUrl: { type: String, default: '' },
  position: { type: String, default: 'homepage' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'Banners' });

export default mongoose.model('Banner', bannerSchema);
