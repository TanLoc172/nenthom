import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { money, formatDate } from '../utils/format.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data));
  }, [id]);

  if (!order) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Đang tải…</p></div>;

  const p = order.pricing;
  const Row = ({ label, value, strong }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: strong ? 0 : 11, fontSize: strong ? 16 : 14, color: strong ? 'var(--ink)' : 'var(--muted)', paddingTop: strong ? 13 : 0, borderTop: strong ? '1px solid #ECE3D5' : 'none' }}>
      <span style={{ fontWeight: strong ? 600 : 400 }}>{label}</span>
      {strong ? <span className="serif" style={{ fontSize: 24, fontWeight: 700, color: 'var(--wood)' }}>{value}</span> : <span style={{ color: 'var(--ink)' }}>{value}</span>}
    </div>
  );

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/orders">Đơn hàng</Link> / <b>{order.orderNumber}</b></div>
        <h1 className="serif">Đơn {order.orderNumber}</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0' }}>Ngày đặt: {formatDate(order.createdAt)} · Trạng thái: <b style={{ color: 'var(--wood)' }}>{order.orderStatus}</b></p>
      </div></div>

      <div className="container acctgrid" style={{ padding: '40px 32px 90px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 42, alignItems: 'start' }}>
        <div>
          {order.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', borderBottom: '1px solid #F3EDE3' }}>
              <div style={{ width: 64, height: 64, borderRadius: 11, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                {it.image && <img src={it.image} alt={it.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{it.productName}</div>
                <div style={{ fontSize: 12, color: '#9b9289', marginTop: 2 }}>{it.sizeLabel} · SL: {it.quantity}</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--wood)' }}>{money(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>

        <aside style={{ position: 'sticky', top: 98, background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Tóm tắt</div>
          <Row label="Tạm tính" value={money(p.subtotal)} />
          {p.discountAmount > 0 && <Row label="Giảm giá" value={'−' + money(p.discountAmount)} />}
          <Row label="Phí vận chuyển" value={p.shippingFee ? money(p.shippingFee) : 'Miễn phí'} />
          <Row label="Tổng cộng" value={money(p.totalAmount)} strong />
        </aside>
      </div>
    </div>
  );
}
