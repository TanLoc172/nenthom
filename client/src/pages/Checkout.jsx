import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { money } from '../utils/format.js';

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    recipientName: '', recipientPhone: '', address: '', province: '',
    paymentMethod: 'COD', guestEmail: '', notes: '',
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const applyCoupon = async () => {
    try {
      const r = await api.post('/coupons/validate', { code: coupon, subtotal: cart.subtotal });
      setDiscount(r.data.discount);
      setCouponMsg(`✓ Giảm ${money(r.data.discount)}`);
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const r = await api.post('/checkout', {
        shipping: {
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          address: form.address,
          province: form.province,
        },
        paymentMethod: form.paymentMethod,
        couponCode: coupon || undefined,
        notes: form.notes,
        guestEmail: user ? undefined : form.guestEmail,
      });
      await refresh();
      navigate(`/order-confirmation/${r.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items.length) return (
    <div className="container" style={{ padding: '80px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 54, marginBottom: 16 }}>🕯️</div>
      <div className="serif" style={{ fontSize: 28, marginBottom: 8 }}>Chưa có sản phẩm để thanh toán</div>
      <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>Mua sắm ngay</Link>
    </div>
  );

  const total = cart.subtotal - discount;
  const Field = ({ k, label, type, required, ...rest }) => (
    <label className="field"><span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>{label}{required && ' *'}</span>
      <input className="inp" type={type || 'text'} value={form[k]} onChange={set(k)} required={required} {...rest} /></label>
  );

  return (
    <div className="container" style={{ padding: '42px 32px 90px' }}>
      <div className="crumb"><Link className="tlink" to="/cart">Giỏ hàng</Link> / <b>Thanh toán</b></div>
      <h1 className="serif" style={{ fontSize: 46, fontWeight: 600, margin: '0 0 34px' }}>Thanh toán</h1>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }} className="cogrid">
        <div>
          {error && <p className="error" style={{ color: '#c0563f', marginBottom: 16 }}>{error}</p>}

          <div style={{ marginBottom: 38 }}>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Thông tin giao hàng</div>
            <div style={{ display: 'grid', gap: 16 }}>
              <Field k="recipientName" label="Họ và tên" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field k="recipientPhone" label="Số điện thoại" required />
                {!user && <Field k="guestEmail" label="Email" type="email" required />}
              </div>
              <Field k="address" label="Địa chỉ" required />
              <Field k="province" label="Tỉnh/Thành" />
              <label className="field"><span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Ghi chú</span>
                <textarea className="inp" value={form.notes} onChange={set('notes')} rows={2} /></label>
            </div>
          </div>

          <div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Phương thức thanh toán</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[['COD', 'Thanh toán khi nhận hàng (COD)', 'Trả tiền mặt khi nhận hàng'], ['VietQR', 'Chuyển khoản VietQR', 'Quét mã QR chuyển khoản ngân hàng']].map(([k, t, s]) => (
                <div key={k} onClick={() => setForm({ ...form, paymentMethod: k })} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 17px', borderRadius: 12, cursor: 'pointer', border: '1.5px solid ' + (form.paymentMethod === k ? 'var(--wood)' : 'var(--line2)'), background: form.paymentMethod === k ? '#FBF6EE' : '#fff' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid ' + (form.paymentMethod === k ? 'var(--wood)' : '#cfc4b3'), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{form.paymentMethod === k && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--wood)' }}></span>}</span>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: '#9b9289' }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 98, background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28 }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Đơn hàng</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 280, overflowY: 'auto', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #ECE3D5' }}>
            {cart.items.map((it) => (
              <div key={it.productId + it.variantSku} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', width: 54, height: 54, borderRadius: 11, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                  {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <span style={{ position: 'absolute', top: -7, right: -7, background: 'var(--wood)', color: '#fff', fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.quantity}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{it.name}</div>{it.sizeLabel && <div style={{ fontSize: 11, color: '#9b9289' }}>{it.sizeLabel}</div>}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wood)' }}>{money(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <input className="inp" placeholder="Mã giảm giá" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button type="button" className="btn btn-dark btn-sm" onClick={applyCoupon}>Áp dụng</button>
          </div>
          {couponMsg && <p style={{ fontSize: 13, margin: '0 0 14px', color: discount > 0 ? 'var(--wood)' : '#c0563f' }}>{couponMsg}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 11, color: 'var(--muted)' }}><span>Tạm tính</span><span style={{ color: 'var(--ink)' }}>{money(cart.subtotal)}</span></div>
          {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 11, color: 'var(--wood)' }}><span>Giảm giá</span><span>−{money(discount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22, paddingTop: 11, borderTop: '1px solid #ECE3D5' }}><span style={{ fontSize: 16, fontWeight: 600 }}>Tổng (chưa gồm ship)</span><span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)' }}>{money(total)}</span></div>
          <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Đặt hàng'}</button>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9b9289', marginTop: 14 }}>Bằng việc đặt hàng, bạn đồng ý với điều khoản của chúng tôi.</div>
        </aside>
      </form>
    </div>
  );
}
