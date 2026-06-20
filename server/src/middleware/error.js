export function notFound(req, res) {
  res.status(404).json({ message: `Không tìm thấy: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ message: err.message || 'Lỗi máy chủ' });
}
