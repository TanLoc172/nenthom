import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { money, formatDate } from '../utils/format.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders')
      .then((r) => setOrders(r.data))
      .catch(() => setError('Không thể tải đơn hàng. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/account">Tài khoản</Link> / <b>Đơn hàng</b></div>
        <h1 className="serif">Đơn hàng của tôi</h1>
      </div></div>

      <div className="container page-pad" style={{ paddingTop: 40, paddingBottom: 90, maxWidth: 880 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 10px', color: '#9b9289' }}>Đang tải…</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 10px', color: '#c0563f' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 10px', color: '#9b9289' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📦</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>Chưa có đơn hàng</div>
            <p style={{ fontSize: 14, margin: '0 0 20px' }}>Bạn chưa đặt đơn hàng nào.</p>
            <Link to="/products" className="btn btn-primary btn-sm">Mua sắm ngay</Link>
          </div>
        ) : (
          orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} style={{ display: 'block', background: '#fff', border: '1px solid #F0E9DD', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9b9289' }}>Mã đơn · {formatDate(o.createdAt)}</div>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--wood)' }}>{o.orderNumber}</div>
                </div>
                <span style={{ background: '#e8f0e4', color: '#4a7a3e', fontSize: 12, fontWeight: 600, padding: '6px 13px', borderRadius: 20 }}>● {o.orderStatus}</span>
                <span style={{ fontSize: 14 }}>Tổng: <b className="serif" style={{ fontSize: 20, color: 'var(--wood)' }}>{money(o.pricing.totalAmount)}</b></span>
              </div>
            </Link>
          ))
        )}

      </div>
    </div>
  );
}
