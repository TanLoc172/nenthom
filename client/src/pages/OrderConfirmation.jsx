import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { formatVnd } from '../utils/format.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => {
      setOrder(r.data);
      if (r.data.payment?.method === 'VietQR') {
        api.get(`/payment/vietqr/${id}`).then((q) => setQr(q.data)).catch(() => {});
      }
    });
  }, [id]);

  if (!order) return <p>Đang tải…</p>;

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1>✅ Đặt hàng thành công!</h1>
      <p>Mã đơn: <strong>{order.orderNumber}</strong></p>
      <p>Tổng tiền: <strong>{formatVnd(order.pricing.totalAmount)}</strong></p>
      <p className="muted">Trạng thái: {order.orderStatus}</p>

      {qr && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h3>Quét mã VietQR để thanh toán</h3>
          <img src={qr.qrUrl} alt="VietQR" style={{ maxWidth: 280 }} />
          <p>{qr.bankName} — {qr.accountNo}</p>
          <p>Nội dung: <strong>{qr.content}</strong></p>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link to="/products" className="btn btn-outline">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
