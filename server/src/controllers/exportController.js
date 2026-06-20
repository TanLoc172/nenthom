import asyncHandler from 'express-async-handler';
import ExcelJS from 'exceljs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

function styleHeader(ws, headers) {
  ws.addRow(headers);
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5651D' } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });
}

async function streamWorkbook(res, wb, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await wb.xlsx.write(res);
  res.end();
}

// GET /api/admin/export/orders?from=&to=&status=
export const exportOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(10000);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Đơn hàng');
  styleHeader(ws, [
    'Mã đơn', 'Người nhận', 'SĐT', 'Địa chỉ', 'Số SP',
    'Tạm tính', 'Giảm giá', 'Phí ship', 'Tổng cộng',
    'Trạng thái', 'Thanh toán', 'PT thanh toán', 'Coupon', 'Ngày đặt',
  ]);
  for (const o of orders) {
    ws.addRow([
      o.orderNumber, o.shipping?.recipientName, o.shipping?.recipientPhone, o.shipping?.address,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.pricing.subtotal, o.pricing.discountAmount, o.pricing.shippingFee, o.pricing.totalAmount,
      o.orderStatus, o.payment?.status, o.payment?.method, o.couponUsed?.code || '',
      new Date(o.createdAt).toLocaleString('vi-VN'),
    ]);
  }
  ws.columns.forEach((c) => (c.width = 16));
  await streamWorkbook(res, wb, `orders-${Date.now()}.xlsx`);
});

// GET /api/admin/export/products
export const exportProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sản phẩm');
  styleHeader(ws, ['Tên', 'Danh mục', 'SKU', 'Size', 'Giá', 'Tồn kho', 'Trạng thái']);
  for (const p of products) {
    for (const v of p.variants) {
      ws.addRow([p.name, p.category?.name, v.sku, v.sizeLabel, v.price, v.stockQuantity, p.isActive ? 'Hiển thị' : 'Ẩn']);
    }
  }
  ws.columns.forEach((c) => (c.width = 18));
  await streamWorkbook(res, wb, `products-${Date.now()}.xlsx`);
});
