import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../uploads');

// POST /api/admin/upload/:folder   (multipart field "files", up to 10)
export const uploadImages = asyncHandler(async (req, res) => {
  const folder = (req.params.folder || 'misc').replace(/[^a-z0-9_-]/gi, '');
  const urls = (req.files || []).map((f) => `/uploads/${folder}/${f.filename}`);
  res.status(201).json({ urls });
});

// DELETE /api/admin/upload   { url }
export const deleteImage = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url?.startsWith('/uploads/')) return res.status(400).json({ message: 'URL không hợp lệ' });
  const abs = path.join(ROOT, url.replace('/uploads/', ''));
  if (abs.startsWith(ROOT) && fs.existsSync(abs)) fs.unlinkSync(abs);
  res.json({ message: 'Đã xoá' });
});
