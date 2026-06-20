import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVnd } from '../utils/format.js';

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
      setCouponMsg(`✓ Giảm ${formatVnd(r.data.discount)}`);
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

  if (!cart.items.length) return <p className="muted">Giỏ hàng trống.</p>;
  const total = cart.subtotal - discount;

  return (
    <div className="detail">
      <form onSubmit={submit}>
        <h1 className="section-title">Thông tin giao hàng</h1>
        {error && <p className="error">{error}</p>}
        <div className="field"><label>Họ tên người nhận</label><input value={form.recipientName} onChange={set('recipientName')} required /></div>
        <div className="field"><label>Số điện thoại</label><input value={form.recipientPhone} onChange={set('recipientPhone')} required /></div>
        {!user && <div className="field"><label>Email</label><input type="email" value={form.guestEmail} onChange={set('guestEmail')} required /></div>}
        <div className="field"><label>Địa chỉ</label><input value={form.address} onChange={set('address')} required /></div>
        <div className="field"><label>Tỉnh/Thành</label><input value={form.province} onChange={set('province')} /></div>
        <div className="field">
          <label>Phương thức thanh toán</label>
          <select value={form.paymentMethod} onChange={set('paymentMethod')}>
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="VietQR">Chuyển khoản VietQR</option>
          </select>
        </div>
        <div className="field"><label>Ghi chú</label><textarea value={form.notes} onChange={set('notes')} rows={2} /></div>
        <button className="btn" disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Đặt hàng'}</button>
      </form>

      <div className="card" style={{ height: 'fit-content' }}>
        <h2>Đơn hàng</h2>
        {cart.items.map((it) => (
          <div key={it.productId + it.variantSku} className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span>{it.name} × {it.quantity}</span>
            <span>{formatVnd(it.lineTotal)}</span>
          </div>
        ))}
        <hr />
        <div className="field" style={{ flexDirection: 'row', gap: 8 }}>
          <input placeholder="Mã giảm giá" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <button type="button" className="btn btn-outline" onClick={applyCoupon}>Áp dụng</button>
        </div>
        {couponMsg && <p className="muted">{couponMsg}</p>}
        <div className="row" style={{ justifyContent: 'space-between' }}><span>Tạm tính</span><span>{formatVnd(cart.subtotal)}</span></div>
        {discount > 0 && <div className="row" style={{ justifyContent: 'space-between' }}><span>Giảm giá</span><span>-{formatVnd(discount)}</span></div>}
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 20, marginTop: 8 }}>
          <strong>Tổng (chưa gồm ship)</strong><strong>{formatVnd(total)}</strong>
        </div>
      </div>
    </div>
  );
}
