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

  // VietQR step state
  const [step, setStep] = useState('form');
  const [orderId, setOrderId] = useState(null);
  const [qrData, setQrData] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/account/addresses').then(r => {
      const list = r.data || [];
      setAddresses(list);
      const def = list.find(a => a.isDefault) || list[0];
      if (def) applyAddress(def);
    }).catch(() => {});
  }, [user]);

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
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/orders/${id}`);
        const status = r.data?.payment?.status;
        if (status === 'paid') {
          clearInterval(pollRef.current);
          await refresh();
          setStep('success');
        }
      } catch { }
    }, 4000);
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
      setOrderId(oid);

      if (form.paymentMethod === 'VietQR') {
        const qr = await api.get(`/payment/vietqr/${oid}`);
        setQrData(qr.data);
        setStep('qr');
        startPolling(oid);
      } else {
        await refresh();
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

  if (step === 'qr') return <QRScreen qrData={qrData} cart={cart} discount={discount} orderId={orderId} />;
  if (step === 'success') return <SuccessScreen orderId={orderId} navigate={navigate} />;

  const total = cart.subtotal - discount;
  const Field = ({ k, label, type, required, ...rest }) => (
    <label className="field">
      <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>{label}{required && ' *'}</span>
      <input className="inp" type={type || 'text'} value={form[k]} onChange={set(k)} required={required} {...rest} />
    </label>
  );

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
              <Field k="recipientName" label="Họ và tên" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field k="recipientPhone" label="Số điện thoại" required />
                {!user && <Field k="guestEmail" label="Email" type="email" required />}
              </div>
              <Field k="address" label="Số nhà, tên đường" required />
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

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 11, color: 'var(--muted)' }}>
            <span>Tạm tính</span><span style={{ color: 'var(--ink)' }}>{money(cart.subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 11, color: 'var(--wood)' }}>
              <span>Giảm giá</span><span>−{money(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22, paddingTop: 11, borderTop: '1px solid #ECE3D5' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Tổng (chưa gồm ship)</span>
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
function QRScreen({ qrData, cart, discount, orderId }) {
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
    <div className="container" style={{ padding: '42px 32px 90px', maxWidth: 960 }}>
      <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Chuyển khoản</b></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, margin: '24px 0 36px' }}>
        <div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 600, margin: '0 0 6px' }}>Quét mã để thanh toán</h1>
          <p style={{ color: '#9b9289', fontSize: 14, margin: 0 }}>Đơn hàng sẽ tự động xác nhận ngay khi chúng tôi nhận được tiền.</p>
        </div>
        {!expired && (
          <div style={{ textAlign: 'center', background: secs < 120 ? '#fde8e8' : 'var(--soft)', border: `1px solid ${secs < 120 ? '#f5aaaa' : '#F0E9DD'}`, borderRadius: 14, padding: '12px 24px' }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9b9289', marginBottom: 4 }}>Mã hết hạn sau</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'monospace', color: secs < 120 ? '#c0392b' : '#2C2C2C' }}>{mm}:{ss}</div>
          </div>
        )}
        {expired && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5aaaa', borderRadius: 14, padding: '12px 24px', color: '#c0392b', fontWeight: 700, fontSize: 14 }}>
            ⚠ Mã QR đã hết hạn — vui lòng đặt lại đơn hàng
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }} className="cogrid">
        {/* Left: QR + bank info */}
        <div>
          {/* QR Code */}
          <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#9b9289', marginBottom: 16 }}>Dùng app ngân hàng quét mã bên dưới</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {qrData?.qrUrl ? (
                <img src={qrData.qrUrl} alt="VietQR" style={{ width: 220, height: 220, borderRadius: 12, border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,.1)', opacity: expired ? 0.35 : 1 }} />
              ) : (
                <div style={{ width: 220, height: 220, borderRadius: 12, background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9289', fontSize: 13 }}>Đang tải mã QR…</div>
              )}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#9b9289' }}>Hỗ trợ: Vietcombank, MB Bank, Techcombank và 40+ ngân hàng</div>
          </div>

          {/* Bank info */}
          <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: '8px 24px 4px' }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, padding: '16px 0 12px', borderBottom: '1px solid #ECE3D5' }}>Thông tin chuyển khoản</div>
            <Row label="Ngân hàng"    value={qrData?.bankName    || '—'} />
            <Row label="Số tài khoản" value={qrData?.accountNo   || '—'} copyKey="acc" />
            <Row label="Chủ tài khoản" value={qrData?.accountName || '—'} />
            <Row label="Số tiền"      value={money(qrData?.amount || total)} copyKey="amt" />
            <div style={{ padding: '11px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#9b9289' }}>Nội dung CK</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#c0563f', fontFamily: 'monospace' }}>{qrData?.content || '—'}</span>
                  <button type="button" onClick={() => copy(qrData?.content, 'content')}
                    style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--line2)', background: copied === 'content' ? '#e8f9ef' : '#fff', color: copied === 'content' ? '#1a7a45' : '#9b9289', cursor: 'pointer', transition: 'all .15s' }}>
                    {copied === 'content' ? '✓ Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#c0563f', marginTop: 4 }}>⚠ Ghi đúng nội dung để đơn được xác nhận tự động</div>
            </div>
          </div>
        </div>

        {/* Right: order summary + polling status */}
        <div>
          {/* Waiting indicator */}
          <div style={{ background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 24, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f5a623', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>Đang chờ xác nhận thanh toán…</span>
            </div>
            <p style={{ fontSize: 13, color: '#9b9289', margin: 0 }}>Trang này sẽ tự cập nhật khi chúng tôi nhận được tiền chuyển khoản của bạn.</p>
          </div>

          {/* Order summary */}
          <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 24 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>Chi tiết đơn hàng</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 260, overflowY: 'auto', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #ECE3D5' }}>
              {cart.items.map((it) => (
                <div key={it.productId + it.variantSku} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 10, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                    {it.image && <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--wood)', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{it.name}</div>
                    {it.sizeLabel && <div style={{ fontSize: 11, color: '#9b9289' }}>{it.sizeLabel}</div>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wood)' }}>{money(it.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#9b9289' }}>
              <span>Tạm tính</span><span style={{ color: '#2C2C2C' }}>{money(cart.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--wood)' }}>
                <span>Giảm giá</span><span>−{money(discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid #ECE3D5' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Cần chuyển khoản</span>
              <span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)' }}>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }`}</style>
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
