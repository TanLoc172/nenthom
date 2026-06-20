import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Order from '../models/Order.js';

const sanitize = (u) => {
  const o = u.toObject();
  delete o.passwordHash;
  delete o.passwordResetToken;
  return o;
};

// ----- Account (self) -----
// GET /api/account/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(sanitize(user));
});

// PUT /api/account/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, gender, dob, avatarUrl, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      phone,
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.gender': gender,
      'profile.dob': dob,
      'profile.avatarUrl': avatarUrl,
    },
    { new: true }
  );
  res.json(sanitize(user));
});

// PUT /api/account/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!(await bcrypt.compare(currentPassword, user.passwordHash)))
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Đổi mật khẩu thành công' });
});

// ----- Addresses -----
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.addresses);
});
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.find((a) => a.addressId === req.params.addressId);
  if (!addr) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.json(user.addresses);
});
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter((a) => a.addressId !== req.params.addressId);
  await user.save();
  res.json(user.addresses);
});

// ----- Admin -----
export const adminListUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = q ? { email: { $regex: q, $options: 'i' } } : {};
  const pageNum = Math.max(1, Number(page));
  const lim = Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash -passwordResetToken').sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
    User.countDocuments(filter),
  ]);

  // Order count + total spend per user (for the listed page)
  const ids = users.map((u) => u._id);
  const stats = await Order.aggregate([
    { $match: { userId: { $in: ids }, orderStatus: { $ne: 'cancelled' } } },
    { $group: { _id: '$userId', orderCount: { $sum: 1 }, totalSpent: { $sum: '$pricing.totalAmount' } } },
  ]);
  const statMap = new Map(stats.map((s) => [String(s._id), s]));
  const items = users.map((u) => {
    const st = statMap.get(String(u._id)) || {};
    return { ...u.toObject(), orderCount: st.orderCount || 0, totalSpent: st.totalSpent || 0 };
  });

  res.json({ items, total, page: pageNum, totalPages: Math.ceil(total / lim) });
});
export const adminGetUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(user);
});
export const adminUpdateUser = asyncHandler(async (req, res) => {
  const { roles, status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { roles, status }, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(user);
});
