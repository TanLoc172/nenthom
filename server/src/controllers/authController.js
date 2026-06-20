import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { signToken, cookieOptions } from '../utils/token.js';
import { sendPasswordReset } from '../utils/email.js';

function publicUser(u) {
  return {
    id: u._id,
    email: u.email,
    phone: u.phone,
    roles: u.roles,
    status: u.status,
    isVerified: u.isVerified,
    profile: u.profile,
    addresses: u.addresses,
  };
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email đã được đăng ký' });

  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(password, 10),
    roles: ['customer'],
    profile: { firstName, lastName },
  });

  const token = signToken(user);
  res.cookie('token', token, cookieOptions);
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  if (user.status !== 'active')
    return res.status(403).json({ message: 'Tài khoản đã bị khoá' });

  const token = signToken(user);
  res.cookie('token', token, cookieOptions);
  res.json({ token, user: publicUser(user) });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Đã đăng xuất' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.json({ user: null });
  const user = await User.findById(req.user.id);
  res.json({ user: user ? publicUser(user) : null });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always return ok to avoid email enumeration
  if (user) {
    user.passwordResetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const link = `${process.env.CLIENT_URL || ''}/reset-password?token=${user.passwordResetToken}`;
    await sendPasswordReset(user.email, user.profile?.firstName, link);
  }
  res.json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi' });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ message: 'Đặt lại mật khẩu thành công' });
});
