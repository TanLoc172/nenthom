import { getAuth } from '@clerk/express';
import User from '../models/User.js';

// Resolves Clerk userId → MongoDB User, sets req.user
export async function authOptional(req, _res, next) {
  const { userId } = getAuth(req);
  if (userId) {
    req.user = await User.findOne({ clerkId: userId }).lean();
  }
  next();
}

export function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId || !req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId || !req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    const userRoles = req.user.roles || [];
    if (!roles.some((r) => userRoles.includes(r)))
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    next();
  };
}

export const requireAdmin = requireRole('admin');
