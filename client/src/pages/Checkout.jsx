import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { money } from '../utils/format.js';
import AddressPicker from '../components/AddressPicker.jsx';

/* ─── step: 'form' | 'qr' | 'success' ─── */
export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipientName: '', recipientPhone: '', address: '',
    province: '', provinceCode: '', district: '', districtCode: '', ward: '', wardCode: '',
    paymentMethod: 'COD', guestEmail: '', notes: '',
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState('');

  // VietQR step state — restored from localStorage only on page reload
  const PENDING_KEY = 'nt_pending_payment';
  const saved = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(PENDING_KEY));
      if (!s) return null;
      // Auto-expire after 15 minutes
      if (s.savedAt && Date.now() - s.savedAt > 15 * 60 * 1000) {
        localStorage.removeItem(PENDING_KEY);
        return null;
      }
      // Only restore on page reload, not on fresh navigation from another page
      const navType = performance.getEntriesByType?.('navigation')?.[0]?.type;
      if (navType !== 'reload') return null;
      return s;
    } catch { return null; }
  })();

  const [step, setStep] = useState(saved?.step || 'form');
  const [orderId, setOrderId] = useState(saved?.orderId || null);
  const [qrData, setQrData] = useState(saved?.qrData || null);
  const [pricing, setPricing] = useState(saved?.pricing || null);
  const [savedShipping, setSavedShipping] = useState(saved?.shipping || null);
  const [savedCoupon, setSavedCoupon] = useState(saved?.couponCode || '');
  const [savedDiscount, setSavedDiscount] = useState(saved?.discount || 0);
  const pollRef = useRef(null);

  // Restore cart items snapshot for QR screen (cart is cleared after order)
  const [cartSnapshot, setCartSnapshot] = useState(saved?.cartSnapshot || null);

  useEffect(() => {
    if (!user) return;
    api.get('/account/addresses').then(r => {
      const list = r.data || [];
      setAddresses(list);
      const def = list.find(a => a.isDefault) || list[0];
      if (def) applyAddress(def);
    }).catch(() => {});
  }, [user]);

  // If restored to QR step, resume polling immediately
  useEffect(() => {
    if (step === 'qr' && orderId) startPolling(orderId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const applyAddress = (addr) => {
    setSelectedAddr(addr.addressId);
    setForm(f => ({
      ...f,
      recipientName:  addr.recipientName  || '',
      recipientPhone: addr.recipientPhone || '',
      address:        addr.addressLine1   || '',
      province:       addr.province       || '',
      provinceCode:   addr.provinceCode   || '',
      district:       addr.district       || '',
      districtCode:   addr.districtCode   || '',
      ward:           addr.ward           || '',
      wardCode:       addr.wardCode       || '',
    }));
  };

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

  const startPolling = (id) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/payment/check/${id}?sync=1`);
        if (r.data?.paid) {
          clearInterval(pollRef.current);
          localStorage.removeItem(PENDING_KEY);
          await refresh();
          setStep('success');
        }
      } catch { }
    }, 3000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fullAddress = [form.address, form.ward, form.district].filter(Boolean).join(', ');
      const r = await api.post('/checkout', {
        shipping: {
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          address: fullAddress,
          province: form.province,
        },
        paymentMethod: form.paymentMethod,
        couponCode: coupon || undefined,
        notes: form.notes,
        guestEmail: user ? undefined : form.guestEmail,
      });

      const oid = r.data._id;
      const pricingData = r.data.pricing || null;
      setOrderId(oid);
      setPricing(pricingData);

      if (form.paymentMethod === 'VietQR') {
        const qr = await api.get(`/payment/vietqr/${oid}`);
        setQrData(qr.data);
        setSavedShipping(form);
        setSavedCoupon(coupon);
        setSavedDiscount(discount);
        setCartSnapshot({ items: cart.items, subtotal: cart.subtotal });

        // Persist to localStorage so reload restores QR screen
        localStorage.setItem(PENDING_KEY, JSON.stringify({
          step: 'qr',
          orderId: oid,
          qrData: qr.data,
          pricing: pricingData,
          shipping: form,
          couponCode: coupon,
          discount,
          cartSnapshot: { items: cart.items, subtotal: cart.subtotal },
          savedAt: Date.now(),
        }));

        setStep('qr');
        startPolling(oid);
      } else {
        await refresh();
        localStorage.removeItem(PENDING_KEY);
        navigate(`/order-confirmation/${oid}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items.length && step === 'form') return (
    <div className="container" style={{ padding: '80px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 54, marginBottom: 16 }}>🕯️</div>
      <div className="serif" style={{ fontSize: 28, marginBottom: 8 }}>Chưa có sản phẩm để thanh toán</div>
      <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>Mua sắm ngay</Link>
    </div>
  );

  if (step === 'qr') return <QRScreen
    qrData={qrData}
    cart={cartSnapshot || cart}
    discount={savedDiscount || discount}
    orderId={orderId}
    shipping={savedShipping || form}
    couponCode={savedCoupon || coupon}
    pricing={pricing}
    onCancel={() => { localStorage.removeItem(PENDING_KEY); setStep('form'); }}
  />;
  if (step === 'success') return <SuccessScreen orderId={orderId} navigate={navigate} />;

  const total = cart.subtotal - discount;

  return (
    <div className="container" style={{ padding: '42px 32px 90px' }}>
      <div className="crumb"><Link className="tlink" to="/cart">Giỏ hàng</Link> / <b>Thanh toán</b></div>
      <h1 className="serif" style={{ fontSize: 46, fontWeight: 600, margin: '0 0 34px' }}>Thanh toán</h1>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }} className="cogrid">
        <div>
          {error && <p className="error" style={{ color: '#c0563f', marginBottom: 16 }}>{error}</p>}

          {/* Shipping info */}
          <div style={{ marginBottom: 38 }}>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Thông tin giao hàng</div>

            {addresses.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', marginBottom: 10 }}>Chọn địa chỉ đã lưu</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addresses.map(addr => {
                    const active = selectedAddr === addr.addressId;
                    const line = [addr.addressLine1, addr.ward, addr.district].filter(Boolean).join(', ');
                    return (
                      <div key={addr.addressId} onClick={() => applyAddress(addr)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${active ? 'var(--wood)' : 'var(--line2)'}`, background: active ? '#FBF6EE' : '#fff', transition: 'all .18s' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${active ? 'var(--wood)' : '#cfc4b3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          {active && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--wood)' }} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {addr.recipientName}
                            {addr.isDefault && <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--wood)', color: '#fff', padding: '2px 7px', borderRadius: 10, fontWeight: 700, verticalAlign: 'middle' }}>Mặc định</span>}
                          </div>
                          <div style={{ fontSize: 13, color: '#9b9289', marginTop: 3 }}>
                            {addr.recipientPhone}{line && <> · {line}</>}{addr.province && <>, {addr.province}</>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div onClick={() => { setSelectedAddr('new'); setForm(f => ({ ...f, recipientName: '', recipientPhone: '', address: '', province: '' })); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 12, cursor: 'pointer', border: `1.5px dashed ${selectedAddr === 'new' ? 'var(--wood)' : 'var(--line2)'}`, background: selectedAddr === 'new' ? '#FBF6EE' : '#fff', transition: 'all .18s' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${selectedAddr === 'new' ? 'var(--wood)' : '#cfc4b3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedAddr === 'new' && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--wood)' }} />}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#4a443c' }}>+ Nhập địa chỉ mới</span>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--line2)', margin: '20px 0' }} />
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              <label className="field">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Họ và tên *</span>
                <input className="inp" value={form.recipientName} onChange={set('recipientName')} required />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label className="field">
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Số điện thoại *</span>
                  <input className="inp" value={form.recipientPhone} onChange={set('recipientPhone')} required />
                </label>
                {!user && (
                  <label className="field">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Email *</span>
                    <input className="inp" type="email" value={form.guestEmail} onChange={set('guestEmail')} required />
                  </label>
                )}
              </div>
              <label className="field">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Số nhà, tên đường *</span>
                <input className="inp" value={form.address} onChange={set('address')} required />
              </label>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Tỉnh / Quận / Phường</span>
                <AddressPicker
                  value={form}
                  onChange={(addr) => setForm(f => ({ ...f, ...addr }))}
                />
              </div>
              <label className="field">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Ghi chú</span>
                <textarea className="inp" value={form.notes} onChange={set('notes')} rows={2} />
              </label>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Phương thức thanh toán</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['COD',    'Thanh toán khi nhận hàng (COD)', 'Trả tiền mặt khi nhận hàng'],
                ['VietQR', 'Chuyển khoản VietQR',            'Quét mã QR — xác nhận tức thì qua Casso'],
              ].map(([k, t, s]) => (
                <div key={k} onClick={() => setForm({ ...form, paymentMethod: k })}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 17px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${form.paymentMethod === k ? 'var(--wood)' : 'var(--line2)'}`, background: form.paymentMethod === k ? '#FBF6EE' : '#fff' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${form.paymentMethod === k ? 'var(--wood)' : '#cfc4b3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    {form.paymentMethod === k && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--wood)' }} />}
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div>
                    <div style={{ fontSize: 12, color: '#9b9289' }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary sidebar */}
        <aside style={{ position: 'sticky', top: 98, background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28 }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Đơn hàng</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 280, overflowY: 'auto', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #ECE3D5' }}>
            {cart.items.map((it) => (
              <div key={it.productId + it.variantSku} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', width: 54, height: 54, borderRadius: 11, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                  {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <span style={{ position: 'absolute', top: -7, right: -7, background: 'var(--wood)', color: '#fff', fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.quantity}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{it.name}</div>
                  {it.sizeLabel && <div style={{ fontSize: 11, color: '#9b9289' }}>{it.sizeLabel}</div>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wood)' }}>{money(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <input className="inp" placeholder="Mã giảm giá" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button type="button" className="btn btn-dark btn-sm" onClick={applyCoupon}>Áp dụng</button>
          </div>
          {couponMsg && <p style={{ fontSize: 13, margin: '0 0 14px', color: discount > 0 ? 'var(--wood)' : '#c0563f' }}>{couponMsg}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: 'var(--muted)' }}>
            <span>Tạm tính</span><span style={{ color: 'var(--ink)' }}>{money(cart.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: 'var(--muted)' }}>
            <span>Phí vận chuyển</span>
            <span style={{ color: '#9b9289', fontSize: 13, fontStyle: 'italic' }}>Tính khi đặt hàng</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: '#1a7a45' }}>
              <span>Giảm giá {coupon && <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#e8f9ef', border: '1px solid #b7e4c7', borderRadius: 5, padding: '1px 6px', marginLeft: 4 }}>{coupon}</span>}</span>
              <span style={{ fontWeight: 600 }}>−{money(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22, paddingTop: 11, borderTop: '1px solid #ECE3D5' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Tạm tính</span>
            <span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)' }}>{money(total)}</span>
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? 'Đang xử lý…' : form.paymentMethod === 'VietQR' ? 'Tạo đơn & Xem mã QR' : 'Đặt hàng'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9b9289', marginTop: 14 }}>
            Bằng việc đặt hàng, bạn đồng ý với điều khoản của chúng tôi.
          </div>
        </aside>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QR PAYMENT SCREEN
───────────────────────────────────────────── */
function QRScreen({ qrData, cart, discount, orderId, shipping = {}, couponCode = '', pricing = null, onCancel }) {
  const EXPIRE = 15 * 60; // 15 phút
  const [secs, setSecs] = useState(EXPIRE);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const expired = secs === 0;

  const copy = (val, key) => {
    navigator.clipboard.writeText(String(val)).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const total = cart.subtotal - discount;

  const Row = ({ label, value, copyKey }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #ECE3D5' }}>
      <span style={{ fontSize: 13, color: '#9b9289' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2C2C' }}>{value}</span>
        {copyKey && (
          <button type="button" onClick={() => copy(value, copyKey)}
            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--line2)', background: copied === copyKey ? '#e8f9ef' : '#fff', color: copied === copyKey ? '#1a7a45' : '#9b9289', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
            {copied === copyKey ? '✓ Đã copy' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '42px 32px 90px', maxWidth: 1200 }}>
      <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Chuyển khoản</b></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, margin: '24px 0 32px' }}>
        <div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: '0 0 5px' }}>Quét mã để thanh toán</h1>
          <p style={{ color: '#9b9289', fontSize: 14, margin: 0 }}>Đơn hàng sẽ tự động xác nhận ngay khi chúng tôi nhận được tiền.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Waiting status */}
          <div style={{ background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 14, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f5a623', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Đang chờ xác nhận…</div>
              <div style={{ fontSize: 11, color: '#9b9289' }}>Trang tự cập nhật khi nhận được tiền</div>
            </div>
          </div>
          {/* Timer / expired */}
          {!expired ? (
            <div style={{ textAlign: 'center', background: secs < 120 ? '#fde8e8' : 'var(--soft)', border: `1px solid ${secs < 120 ? '#f5aaaa' : '#F0E9DD'}`, borderRadius: 14, padding: '10px 22px' }}>
              <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9b9289', marginBottom: 3 }}>Mã hết hạn sau</div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: secs < 120 ? '#c0392b' : '#2C2C2C' }}>{mm}:{ss}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ background: '#fde8e8', border: '1px solid #f5aaaa', borderRadius: 14, padding: '10px 22px', color: '#c0392b', fontWeight: 700, fontSize: 14 }}>
                ⚠ Mã QR đã hết hạn
              </div>
              {onCancel && (
                <button onClick={onCancel} className="btn btn-outline btn-sm">Đặt lại đơn hàng</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Col 1: QR code */}
        <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#9b9289', marginBottom: 14 }}>Dùng app ngân hàng quét mã</div>
          {qrData?.qrUrl ? (
            <img src={qrData.qrUrl} alt="VietQR" style={{ width: '100%', maxWidth: 200, aspectRatio: '1/1', borderRadius: 12, border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,.1)', opacity: expired ? 0.35 : 1 }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9289', fontSize: 13 }}>Đang tải…</div>
          )}
          <div style={{ marginTop: 14, fontSize: 11, color: '#9b9289', lineHeight: 1.5 }}>Vietcombank, MB Bank, Techcombank và 40+ ngân hàng</div>
        </div>

        {/* Col 2: Bank info */}
        <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: '8px 24px 12px' }}>
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, padding: '16px 0 12px', borderBottom: '1px solid #ECE3D5' }}>Thông tin chuyển khoản</div>
          <Row label="Ngân hàng"     value={qrData?.bankName    || '—'} />
          <Row label="Số tài khoản"  value={qrData?.accountNo   || '—'} copyKey="acc" />
          <Row label="Chủ tài khoản" value={qrData?.accountName || '—'} />
          <Row label="Số tiền"       value={money(qrData?.amount || total)} copyKey="amt" />
          <div style={{ padding: '11px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#9b9289', flexShrink: 0 }}>Nội dung CK</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#c0563f', fontFamily: 'monospace', wordBreak: 'break-all' }}>{qrData?.content || '—'}</span>
                <button type="button" onClick={() => copy(qrData?.content, 'content')}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--line2)', background: copied === 'content' ? '#e8f9ef' : '#fff', color: copied === 'content' ? '#1a7a45' : '#9b9289', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  {copied === 'content' ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#c0563f', marginTop: 5 }}>⚠ Ghi đúng nội dung để đơn được xác nhận tự động</div>
          </div>
        </div>

        {/* Col 3: Order summary + waiting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order summary */}
          <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: '16px 20px' }}>
            <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Chi tiết đơn hàng</div>

            {/* Recipient info */}
            <div style={{ background: 'var(--soft)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4a443c', marginBottom: 2 }}>Người nhận</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{shipping.recipientName || '—'} <span style={{ fontWeight: 400, color: '#9b9289' }}>· {shipping.recipientPhone || '—'}</span></div>
              {(shipping.address || shipping.ward || shipping.district || shipping.province) && (
                <div style={{ fontSize: 12, color: '#6b6560', lineHeight: 1.5 }}>
                  {[shipping.address, shipping.ward, shipping.district, shipping.province].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 220, overflowY: 'auto', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #ECE3D5' }}>
              {cart.items.map((it) => (
                <div key={it.productId + it.variantSku} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 9, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                    {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--wood)', color: '#fff', fontSize: 10, fontWeight: 700, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{it.name}</div>
                    {it.sizeLabel && <div style={{ fontSize: 11, color: '#9b9289' }}>{it.sizeLabel}</div>}
                    <div style={{ fontSize: 11, color: '#9b9289' }}>SL: {it.quantity}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wood)', flexShrink: 0 }}>{money(it.lineTotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            {(() => {
              const subtotal  = pricing?.subtotal      ?? cart.subtotal;
              const shipFee   = pricing?.shippingFee   ?? 0;
              const disc      = pricing?.discountAmount ?? discount;
              const grandTotal = pricing?.totalAmount  ?? (subtotal + shipFee - disc);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9b9289' }}>
                    <span>Tạm tính ({cart.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                    <span style={{ color: '#2C2C2C' }}>{money(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9b9289' }}>
                    <span>Phí vận chuyển</span>
                    <span style={{ color: shipFee === 0 ? '#1a7a45' : '#2C2C2C', fontWeight: shipFee === 0 ? 600 : 400 }}>
                      {shipFee === 0 ? 'Miễn phí' : money(shipFee)}
                    </span>
                  </div>
                  {disc > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9b9289' }}>
                        Giảm giá
                        {couponCode && <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#FBF6EE', border: '1px solid #EDE5D8', borderRadius: 5, padding: '1px 6px', marginLeft: 6 }}>{couponCode}</span>}
                      </span>
                      <span style={{ color: '#1a7a45', fontWeight: 600 }}>−{money(disc)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 4, borderTop: '1px solid #ECE3D5' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Cần chuyển khoản</span>
                    <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--wood)' }}>{money(grandTotal)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}@media(max-width:860px){div[style*="grid-template-columns: 240px 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUCCESS SCREEN
───────────────────────────────────────────── */
function SuccessScreen({ orderId, navigate }) {
  return (
    <div className="container" style={{ padding: '80px 32px', textAlign: 'center', maxWidth: 560 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8f9ef', border: '2px solid #b7e4c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
      <h1 className="serif" style={{ fontSize: 38, fontWeight: 600, margin: '0 0 12px', color: '#1a7a45' }}>Đặt hàng thành công!</h1>
      <p style={{ fontSize: 15, color: '#9b9289', marginBottom: 32, lineHeight: 1.7 }}>
        Thanh toán đã được xác nhận. Chúng tôi sẽ chuẩn bị đơn hàng và giao đến bạn sớm nhất!
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/order-confirmation/${orderId}`)}>Xem chi tiết đơn hàng</button>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>Tiếp tục mua sắm</button>
      </div>
    </div>
  );
}
