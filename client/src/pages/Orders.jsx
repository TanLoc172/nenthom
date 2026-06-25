import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { money } from '../utils/format.js';

const STATUS = {
  pending:    { color: '#f5a623', bg: '#FFF8EC', label: 'Chờ xác nhận' },
  confirmed:  { color: '#2c7be5', bg: '#EBF2FD', label: 'Đã xác nhận' },
  processing: { color: '#7B5EA7', bg: '#F3EEFF', label: 'Đang xử lý' },
  shipped:    { color: '#0DA5A5', bg: '#E6F9F9', label: 'Đang giao' },
  delivered:  { color: '#1a7a45', bg: '#e8f0e4', label: 'Đã giao' },
  cancelled:  { color: '#c0563f', bg: '#FFF0EE', label: 'Đã huỷ' },
};

const PAY_METHOD = { VietQR: 'VietQR', COD: 'COD' };

function fmtDT(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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
      <div className="pagehead">
        <div className="container">
          <div className="crumb">
            <Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/account">Tài khoản</Link> / <b>Đơn hàng</b>
          </div>
          <h1 className="serif">Đơn hàng của tôi</h1>
        </div>
      </div>

      <div className="container page-pad" style={{ paddingTop: 40, paddingBottom: 90, maxWidth: 900 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 10px', color: '#9b9289' }}>Đang tải…</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 10px', color: '#c0563f' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 10px' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>Chưa có đơn hàng</div>
            <p style={{ fontSize: 14, color: '#9b9289', margin: '0 0 20px' }}>Bạn chưa đặt đơn hàng nào.</p>
            <Link to="/products" className="btn btn-primary btn-sm">Mua sắm ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map((o) => {
              const st = STATUS[o.orderStatus] || { color: '#9b9289', bg: '#f5f5f5', label: o.orderStatus };
              const firstItem = o.items?.[0];
              const extraItems = Math.max(0, (o.items?.length || 1) - 1);

              return (
                <Link key={o._id} to={`/orders/${o._id}`} style={{ display: 'block', background: '#fff', border: '1px solid #F0E9DD', borderRadius: 16, padding: '20px 24px', textDecoration: 'none', transition: 'box-shadow .15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,.07)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div>
                      <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: 'var(--wood)', letterSpacing: 0.3 }}>{o.orderNumber}</div>
                      <div style={{ fontSize: 12, color: '#9b9289', marginTop: 3 }}>
                        {fmtDT(o.createdAt)}
                        {o.payment?.method && <span style={{ marginLeft: 8, background: '#f5f0e8', color: '#7a6851', borderRadius: 8, padding: '1px 7px' }}>{PAY_METHOD[o.payment.method] || o.payment.method}</span>}
                      </div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 20, flex: 'none' }}>
                      ● {st.label}
                    </span>
                  </div>

                  {/* Product preview + total */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {(firstItem?.imageUrl || firstItem?.image) && (
                        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: '#f4e7cb', flex: 'none' }}>
                          <img src={firstItem.imageUrl || firstItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {firstItem?.productName}
                        </div>
                        <div style={{ fontSize: 12, color: '#9b9289', marginTop: 2 }}>
                          {firstItem?.sizeLabel && firstItem.sizeLabel}
                          {extraItems > 0 && <span> · và {extraItems} sản phẩm khác</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flex: 'none' }}>
                      <div style={{ fontSize: 11, color: '#9b9289', marginBottom: 1 }}>Tổng cộng</div>
                      <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--wood)' }}>{money(o.pricing.totalAmount)}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
