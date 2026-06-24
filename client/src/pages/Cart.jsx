import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/format.js';

const FREE_SHIP_THRESHOLD = 500000;

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items.length) return (
    <div className="container page-pad" style={{ paddingTop: 42, paddingBottom: 90 }}>
      <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Giỏ hàng</b></div>
      <h1 className="serif" style={{ fontSize: 46, fontWeight: 600, margin: '0 0 34px' }}>Giỏ hàng của bạn</h1>
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9b9289' }}>
        <div style={{ fontSize: 54, marginBottom: 16 }}>🕯️</div>
        <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 8 }}>Giỏ hàng đang trống</div>
        <p style={{ fontSize: 14, margin: '0 0 26px' }}>Khám phá bộ sưu tập nến thơm và thêm chút hương thơm cho ngôi nhà.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Mua sắm ngay</Link>
      </div>
    </div>
  );

  const subtotal = cart.subtotal ?? cart.items.reduce((s, i) => s + i.lineTotal, 0);
  const toFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const freeShipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  return (
    <div className="container page-pad" style={{ paddingTop: 42, paddingBottom: 90 }}>
      <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Giỏ hàng</b></div>
      <h1 className="serif" style={{ fontSize: 'clamp(30px,5vw,46px)', fontWeight: 600, margin: '0 0 34px' }}>Giỏ hàng của bạn</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 42, alignItems: 'start' }} className="cartgrid">
        <div>
          {/* Free ship progress */}
          <div style={{ background: 'var(--soft)', borderRadius: 12, padding: '14px 18px', marginBottom: 22, border: '1px solid #F0E9DD' }}>
            {toFreeShip > 0
              ? <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#4a443c' }}>Mua thêm <strong style={{ color: 'var(--wood)' }}>{money(toFreeShip)}</strong> để được <strong>miễn phí giao hàng</strong> 🚚</p>
              : <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#1a7a45', fontWeight: 600 }}>🎉 Bạn đã đủ điều kiện miễn phí giao hàng!</p>}
            <div style={{ height: 6, background: '#EFE8DC', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${freeShipPct}%`, background: 'linear-gradient(90deg,#9c7a55,#765939)', borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.2fr 1fr 32px', gap: 14, padding: '0 4px 14px', borderBottom: '1px solid var(--line)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9b9289' }} className="cart-th">
            <span>Sản phẩm</span><span style={{ textAlign: 'center' }}>Đơn giá</span><span style={{ textAlign: 'center' }}>Số lượng</span><span style={{ textAlign: 'right' }}>Thành tiền</span><span></span>
          </div>

          {cart.items.map((it) => (
            <div key={it.productId + it.variantSku} className="cart-row" style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.2fr 1fr 32px', gap: 14, alignItems: 'center', padding: '22px 4px', borderBottom: '1px solid #F3EDE3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link to={`/products/${it.slug}`} style={{ width: 80, height: 80, borderRadius: 13, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                  {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </Link>
                <div>
                  <Link to={`/products/${it.slug}`} className="serif" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: 'var(--ink)' }}>{it.name}</Link>
                  {it.sizeLabel && <div style={{ fontSize: 12, color: '#9b9289', marginTop: 3 }}>{it.sizeLabel}</div>}
                </div>
              </div>
              <span style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>{money(it.price)}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line2)', borderRadius: 10, overflow: 'hidden' }}>
                  <span onClick={() => updateItem(it.productId, it.variantSku, it.quantity - 1)} style={{ width: 34, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--wood)', fontSize: 16 }}>−</span>
                  <span style={{ width: 34, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{it.quantity}</span>
                  <span onClick={() => updateItem(it.productId, it.variantSku, it.quantity + 1)} style={{ width: 34, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--wood)', fontSize: 16 }}>+</span>
                </div>
              </div>
              <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: 'var(--wood)' }}>{money(it.lineTotal)}</span>
              <span className="x" style={{ fontSize: 20, textAlign: 'center' }} onClick={() => removeItem(it.productId, it.variantSku)}>×</span>
            </div>
          ))}

          <div style={{ marginTop: 26 }}><Link to="/products" className="under">← Tiếp tục mua sắm</Link></div>
        </div>

        <aside style={{ position: 'sticky', top: 98, background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28 }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 22 }}>Tóm tắt đơn hàng</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 11, color: 'var(--muted)' }}><span>Tạm tính</span><span style={{ color: 'var(--ink)' }}>{money(subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ECE3D5', color: 'var(--muted)' }}><span>Phí vận chuyển</span><span style={{ color: 'var(--ink)' }}>{toFreeShip > 0 ? 'Tính khi thanh toán' : 'Miễn phí'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}><span style={{ fontSize: 16, fontWeight: 600 }}>Tổng cộng</span><span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)' }}>{money(subtotal)}</span></div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout')}>Tiến hành thanh toán</button>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['🔒 Thanh toán bảo mật 100%', '🚚 Giao hàng toàn quốc', '🔄 Đổi trả trong 7 ngày'].map((t) => (
              <div key={t} style={{ fontSize: 12.5, color: '#6b5e52' }}>{t}</div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
