import { PageView } from '../models/misc.js';

const SKIP_EXT = new Set(['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.map', '.webp', '.avif', '.mp4']);
const BOT_TOKENS = ['bot', 'crawler', 'spider', 'slurp', 'pingdom', 'uptimerobot',
  'googlebot', 'baiduspider', 'yandex', 'ahrefsbot', 'semrushbot'];

// Logs page views for non-asset GET requests. Fire-and-forget, never blocks.
export function pageView(req, _res, next) {
  next();
  try {
    if (req.method !== 'GET') return;
    const p = req.path || '/';
    const ext = (p.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
    if (ext && SKIP_EXT.has(ext)) return;
    if (p.startsWith('/api/admin') || p.startsWith('/api/cart/count')) return;

    const ua = (req.headers['user-agent'] || '').toLowerCase();
    if (BOT_TOKENS.some((t) => ua.includes(t))) return;

    const ip = (req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.ip || 'unknown';
    PageView.create({ path: p, ipAddress: ip, userId: req.user?.id || null }).catch(() => {});
  } catch {
    /* never fail a request */
  }
}
