import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const folder = (req.params.folder || 'misc').replace(/[^a-z0-9_-]/gi, '');
    const dir = path.join(ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh'), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });
