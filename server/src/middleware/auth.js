import jwt from 'jsonwebtoken';

export function authOptional(req, _res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    const userRoles = req.user.roles || [];
    if (!roles.some((r) => userRoles.includes(r)))
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    next();
  };
}

export const requireAdmin = requireRole('admin');
