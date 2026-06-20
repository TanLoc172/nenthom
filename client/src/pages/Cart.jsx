import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatVnd } from '../utils/format.js';

const FREE_SHIP_THRESHOLD = 500000;

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items.length) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontFamily: 'Georgia, serif', color: '#2C2C2C', marginBottom: 8 }}>Giỏ hàng trống</h2>
      <p className="muted" style={{ marginBottom: 24 }}>Hãy khám phá các sản phẩm nến thơm của chúng tôi</p>
      <Link to="/products" className="btn">Mua sắm ngay</Link>
    </div>
  );

  const subtotal = cart.subtotal ?? cart.items.reduce((s, i) => s + i.lineTotal, 0);
  const toFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const freeShipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  return (
    <div>
      <h1 className="section-title">Giỏ hàng</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
        {/* Items */}
        <div>
          {/* Free ship progress */}
          <div style={{ background: '#F5EFE6', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            {toFreeShip > 0 ? (
              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#4a443c' }}>
                Mua thêm <strong style={{ color: '#8B6B4A' }}>{formatVnd(toFreeShip)}</strong> để được <strong>miễn phí giao hàng</strong> 🚚
              </p>
            ) : (
              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#1a7a45', fontWeight: 600 }}>
                🎉 Bạn đã đủ điều kiện miễn phí giao hàng!
              </p>
            )}
            <div style={{ height: 6, background: '#EFE8DC', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${freeShipPct}%`, background: 'linear-gradient(90deg,#9c7a55,#765939)', borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.items.map((it) => (
              <div key={it.productId + it.variantSku}
                style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#fff', border: '1px solid #EFE8DC', borderRadius: 14, padding: '16px', transition: 'box-shadow .2s' }}>
                {/* Thumbnail */}
                <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                  {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/products/${it.slug}`} style={{ fontWeight: 600, fontSize: 15, color: '#2C2C2C', display: 'block', marginBottom: 2 }}
                    className="hover-primary">{it.name}</Link>
                  {it.sizeLabel && <div style={{ fontSize: 12.5, color: '#9b9289', marginBottom: 6 }}>{it.sizeLabel}</div>}
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#8B6B4A' }}>{formatVnd(it.price)}</div>
                </div>

                {/* Qty stepper */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #EFE8DC', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <button onClick={() => updateItem(it.productId, it.variantSku, it.quantity - 1)}
                    style={{ width: 34, height: 38, background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', color: '#4a443c' }}>−</button>
                  <span style={{ width: 34, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{it.quantity}</span>
                  <button onClick={() => updateItem(it.productId, it.variantSku, it.quantity + 1)}
                    style={{ width: 34, height: 38, background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', color: '#4a443c' }}>+</button>
                </div>

                {/* Line total */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C' }}>{formatVnd(it.lineTotal)}</div>
                  <button onClick={() => removeItem(it.productId, it.variantSku)}
                    style={{ background: 'none', border: 'none', fontSize: 12, color: '#b7ada0', cursor: 'pointer', marginTop: 4, padding: 0 }}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, fontSize: 14, color: '#9b9289', fontWeight: 500 }}>
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Order summary */}
        <div style={{ background: '#F5EFE6', borderRadius: 16, padding: '24px', position: 'sticky', top: 90 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', margin: '0 0 20px', fontSize: 18, color: '#2C2C2C' }}>Tóm tắt đơn hàng</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <Row label="Tạm tính" value={formatVnd(subtotal)} />
            <Row label="Phí giao hàng" value={toFreeShip > 0 ? 'Tính khi thanh toán' : <span style={{ color: '#1a7a45', fontWeight: 600 }}>Miễn phí</span>} />
          </div>

          <div style={{ borderTop: '1px solid #EFE8DC', paddingTop: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C' }}>Tổng cộng</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#8B6B4A' }}>{formatVnd(subtotal)}</span>
          </div>

          <button className="btn" style={{ width: '100%', padding: '15px', fontSize: 15, borderRadius: 12, letterSpacing: .2 }}
            onClick={() => navigate('/checkout')}>
            Thanh toán →
          </button>

          {/* Trust mini */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['🔒 Thanh toán bảo mật 100%', '🚚 Giao hàng toàn quốc', '🔄 Đổi trả trong 7 ngày'].map((t) => (
              <div key={t} style={{ fontSize: 12.5, color: '#6b5e52' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4a443c' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
