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
  const addInfo = order.orderNumber; // dùng để đối soát qua Casso
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

// POST /api/payment/casso/webhook  -> reconcile bank transfers (Casso)
// Casso gửi danh sách giao dịch; ta khớp theo addInfo (orderNumber) + amount.
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
      order.statusHistory.push({ status: order.orderStatus, comment: 'Tự động đối soát qua Casso (đã thanh toán)' });
      await order.save();
      matched++;
    }
  }
  res.json({ success: true, matched });
});

function extractOrderNumbers(desc) {
  const m = desc.match(/ES\d{8,}/g);
  return m || [];
}
