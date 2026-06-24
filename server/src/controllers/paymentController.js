import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

// GET /api/payment/vietqr/:orderId  -> returns QR image url + transfer info
export const getVietQr = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  const bin = process.env.VIETQR_BANK_BIN;
  const acc = process.env.VIETQR_ACCOUNT_NO;
  const template = process.env.VIETQR_TEMPLATE || 'compact2';
  const amount = Math.round(order.pricing.totalAmount);
  const addInfo = order.orderNumber;
  const accountName = encodeURIComponent(process.env.VIETQR_ACCOUNT_NAME || '');

  const qrUrl = `https://img.vietqr.io/image/${bin}-${acc}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${accountName}`;

  res.json({
    qrUrl,
    bankName: process.env.VIETQR_BANK_NAME,
    accountNo: acc,
    accountName: process.env.VIETQR_ACCOUNT_NAME,
    amount,
    content: addInfo,
    orderStatus: order.orderStatus,
    paymentStatus: order.payment.status,
  });
});

// GET /api/payment/check/:orderId?sync=1
// Fast path: check DB only (called every 1s).
// Slow path: also call Casso API when ?sync=1 (called every 5s).
export const checkPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId, 'payment orderStatus pricing orderNumber');
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  if (order.payment.status === 'paid') {
    return res.json({ paid: true, orderStatus: order.orderStatus });
  }

  // Only call Casso when client explicitly requests a sync
  if (req.query.sync !== '1') {
    return res.json({ paid: false });
  }

  const apiKey = process.env.CASSO_API_KEY;
  if (!apiKey) return res.json({ paid: false });

  try {
    const cassoRes = await fetch('https://oauth.casso.vn/v2/transactions?sort=DESC&pageSize=50', {
      headers: { Authorization: `apikey ${apiKey}`, 'Content-Type': 'application/json' },
    });
    if (!cassoRes.ok) {
      console.warn('[Casso] HTTP', cassoRes.status);
      return res.json({ paid: false, cassoStatus: cassoRes.status });
    }

    const cassoData = await cassoRes.json();
    // Casso v2: data.records array; fallback to data as array
    const transactions = Array.isArray(cassoData?.data?.records)
      ? cassoData.data.records
      : Array.isArray(cassoData?.data)
        ? cassoData.data
        : [];

    for (const tx of transactions) {
      const desc = (tx.description || tx.memo || '').toUpperCase();
      const nums = extractOrderNumbers(desc);
      if (nums.includes(order.orderNumber.toUpperCase())) {
        // Loose amount check: within 500đ tolerance (bank fees etc.)
        if (Math.abs((tx.amount || 0) - order.pricing.totalAmount) <= 500) {
          order.payment.status = 'paid';
          order.payment.transactionId = String(tx.id || tx.tid || '');
          order.payment.paidAt = new Date(tx.when || tx.bookingDate || Date.now());
          if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
          order.statusHistory.push({ status: order.orderStatus, comment: 'Tự động đối soát qua Casso API' });
          await order.save();
          return res.json({ paid: true, orderStatus: order.orderStatus });
        }
      }
    }
  } catch (err) {
    console.error('[Casso]', err.message);
  }

  res.json({ paid: false });
});

// POST /api/payment/casso/webhook  -> webhook từ Casso (backup)
export const cassoWebhook = asyncHandler(async (req, res) => {
  const secure = req.headers['secure-token'];
  if (process.env.CASSO_SECURE_TOKEN && secure !== process.env.CASSO_SECURE_TOKEN)
    return res.status(401).json({ message: 'Invalid token' });

  const transactions = req.body?.data || [];
  let matched = 0;
  for (const tx of transactions) {
    const desc = (tx.description || '').toUpperCase();
    const order = await Order.findOne({
      orderNumber: { $in: extractOrderNumbers(desc) },
      'payment.status': 'unpaid',
    });
    if (order && Math.abs((tx.amount || 0) - order.pricing.totalAmount) < 1) {
      order.payment.status = 'paid';
      order.payment.transactionId = String(tx.id || tx.tid || '');
      order.payment.paidAt = new Date();
      if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
      order.statusHistory.push({ status: order.orderStatus, comment: 'Tự động đối soát qua Casso webhook' });
      await order.save();
      matched++;
    }
  }
  res.json({ success: true, matched });
});

// GET /api/payment/casso-debug  (admin only) — raw Casso transactions + order match info
export const cassoDebug = asyncHandler(async (req, res) => {
  const apiKey = process.env.CASSO_API_KEY;
  if (!apiKey) return res.status(400).json({ message: 'CASSO_API_KEY chưa cấu hình' });

  const cassoRes = await fetch('https://oauth.casso.vn/v2/transactions?sort=DESC&pageSize=10', {
    headers: { Authorization: `apikey ${apiKey}` },
  });
  const raw = await cassoRes.json();
  const transactions = Array.isArray(raw?.data?.records) ? raw.data.records
    : Array.isArray(raw?.data) ? raw.data : [];

  res.json({
    httpStatus: cassoRes.status,
    error: raw.error,
    totalRecords: raw?.data?.totalRecords ?? transactions.length,
    transactions: transactions.slice(0, 10).map(tx => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      memo: tx.memo,
      when: tx.when,
      bookingDate: tx.bookingDate,
      extractedOrderNums: extractOrderNumbers((tx.description || tx.memo || '').toUpperCase()),
    })),
  });
});

// POST /api/admin/orders/:id/confirm-payment  (admin manual confirm)
export const adminConfirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (order.payment.status === 'paid') return res.json({ message: 'Đã thanh toán rồi', order });

  order.payment.status = 'paid';
  order.payment.paidAt = new Date();
  order.payment.transactionId = req.body.transactionId || 'manual';
  if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
  order.statusHistory.push({ status: order.orderStatus, comment: `Xác nhận thủ công bởi admin` });
  await order.save();
  res.json({ message: 'Đã xác nhận thanh toán', order });
});

function extractOrderNumbers(desc) {
  const m = desc.match(/ES\d{8,}/gi);
  return m ? m.map(s => s.toUpperCase()) : [];
}
