import { AuditLog } from '../models/misc.js';

const ACTION = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };

// Auto-logs mutating admin requests after a successful response.
// Mounted on the admin router so every create/update/delete is recorded.
export function auditLogger(req, res, next) {
  const action = ACTION[req.method];
  if (!action) return next();

  res.on('finish', () => {
    if (res.statusCode >= 400) return; // only log successful mutations
    try {
      // /admin/products/:id -> collection "products"
      const segs = req.path.split('/').filter(Boolean);
      const collectionName = segs[0] || 'unknown';
      const documentId = /^[0-9a-fA-F]{24}$/.test(segs[1] || '') ? segs[1] : null;
      const ip = (req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.ip || 'unknown';

      AuditLog.create({
        userId: req.user?.id,
        action,
        collectionName,
        documentId,
        changes: { method: req.method, path: req.originalUrl, body: redact(req.body) },
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {});
    } catch {
      /* never break the response */
    }
  });
  next();
}

// Avoid storing sensitive fields in the audit trail.
function redact(body) {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  for (const k of ['password', 'newPassword', 'currentPassword', 'passwordHash']) delete clone[k];
  return clone;
}
