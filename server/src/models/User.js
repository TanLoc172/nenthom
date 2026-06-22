import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  addressId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  recipientName: { type: String, default: '' },
  recipientPhone: { type: String, default: '' },
  addressLine1: { type: String, default: '' },
  addressLine2: String,
  ward: { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  country: { type: String, default: 'Vietnam' },
  isDefault: { type: Boolean, default: false },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: String,
  dob: Date,
  avatarUrl: String,
  loyaltyPoints: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  clerkId: { type: String, index: true, sparse: true },
  email: { type: String, required: true, index: true },
  passwordHash: { type: String, default: '' },
  phone: String,
  roles: { type: [String], default: ['customer'] },
  status: { type: String, default: 'active' },
  isVerified: { type: Boolean, default: false },
  profile: { type: profileSchema, default: () => ({}) },
  addresses: { type: [addressSchema], default: [] },
  passwordResetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true, collection: 'Users' });

export default mongoose.model('User', userSchema);
