import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { money } from '../utils/format.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => {
      setOrder(r.data);
      if (r.data.payment?.method === 'VietQR') {
        api.get(`/payment/vietqr/${id}`).then((q) => setQr(q.data)).catch(() => {});
      }
    }).catch(() => setError('Không thể tải thông tin đơn hàng.'));
  }, [id]);

  if (error) return <div className="container page-pad" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}><p style={{ color: '#c0563f' }}>{error}</p></div>;
  if (!order) return <div className="container page-pad" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}><p className="muted">Đang tải…</p></div>;

  const ship = order.shipping || {};

  return (
    <div className="container page-pad" style={{ maxWidth: 620, paddingTop: 80, paddingBottom: 110, textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 104, height: 104, margin: '0 auto 30px' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--wood)', opacity: .18, animation: 'ring 1.6s ease-out infinite' }}></span>
        <div style={{ position: 'relative', width: 104, height: 104, borderRadius: '50%', background: 'var(--wood)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="52" height="52" viewBox="0 0 52 52"><path d="M14 27 l8 8 l16 -19" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" strokeDashoffset="48" style={{ animation: 'checkmark .6s .25s ease forwards' }} /></svg>
        </div>
      </div>
      <h1 className="serif" style={{ fontSize: 44, fontWeight: 600, margin: '0 0 12px' }}>Đặt hàng thành công!</h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 36px' }}>Cảm ơn bạn đã tin tưởng Nến Thơm ABC. Chúng tôi đã nhận được đơn hàng và sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>

      <div style={{ background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 30, textAlign: 'left', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 18, borderBottom: '1px dashed var(--beige)', marginBottom: 18 }}>
          <div><div style={{ fontSize: 12, color: '#9b9289', letterSpacing: 1, textTransform: 'uppercase' }}>Mã đơn hàng</div><div className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)', letterSpacing: 1 }}>{order.orderNumber}</div></div>
          <span style={{ background: '#e8f0e4', color: '#4a7a3e', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20 }}>● {order.orderStatus}</span>
        </div>
        <div style={{ display: 'grid', gap: 13, fontSize: 14 }}>
          {ship.recipientName && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9b9289' }}>Người nhận</span><span style={{ fontWeight: 600 }}>{ship.recipientName}</span></div>}
          {ship.address && <div style={{ display: 'flex', justifyContent: 'space-between', gap: 30 }}><span style={{ color: '#9b9289', flex: 'none' }}>Địa chỉ</span><span style={{ fontWeight: 500, textAlign: 'right' }}>{[ship.address, ship.province].filter(Boolean).join(', ')}</span></div>}
          {order.payment?.method && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#9b9289' }}>Thanh toán</span><span style={{ fontWeight: 600 }}>{order.payment.method}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 13, borderTop: '1px solid #ECE3D5' }}><span style={{ color: '#9b9289' }}>Tổng cộng</span><span className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--wood)' }}>{money(order.pricing.totalAmount)}</span></div>
        </div>
      </div>

      {qr && (
        <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 30, marginBottom: 32 }}>
          <h3 className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Quét mã VietQR để thanh toán</h3>
          <img src={qr.qrUrl} alt="VietQR" style={{ maxWidth: 280, margin: '0 auto' }} />
          <p style={{ marginTop: 12 }}>{qr.bankName} — {qr.accountNo}</p>
          <p>Nội dung: <strong>{qr.content}</strong></p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/products" className="btn btn-primary btn-lg">Tiếp tục mua sắm</Link>
        <Link to="/orders" className="btn btn-outline btn-lg">Theo dõi đơn hàng</Link>
      </div>
    </div>
  );
}
