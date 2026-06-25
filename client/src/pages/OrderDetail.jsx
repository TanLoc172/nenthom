import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { money } from '../utils/format.js';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_LABELS = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped:    'Đang giao',
  delivered:  'Đã giao',
};
const STATUS_MAP = {
  pending:    { color: '#f5a623', bg: '#FFF8EC', label: 'Chờ xác nhận' },
  confirmed:  { color: '#2c7be5', bg: '#EBF2FD', label: 'Đã xác nhận' },
  processing: { color: '#7B5EA7', bg: '#F3EEFF', label: 'Đang xử lý' },
  shipped:    { color: '#0DA5A5', bg: '#E6F9F9', label: 'Đang giao hàng' },
  delivered:  { color: '#1a7a45', bg: '#e8f0e4', label: 'Đã giao hàng' },
  cancelled:  { color: '#c0563f', bg: '#FFF0EE', label: 'Đã huỷ' },
};
const PAY_METHOD = {
  VietQR: 'VietQR — Chuyển khoản ngân hàng',
  COD: 'Thanh toán khi nhận hàng (COD)',
};
const PAY_STATUS = {
  paid:   { label: 'Đã thanh toán', color: '#1a7a45' },
  unpaid: { label: 'Chưa thanh toán', color: '#f5a623' },
};

function fmtDT(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtD(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 28, marginBottom: 20 }}>
      {title && <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 18 }}>{title}</div>}
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10, fontSize: 14 }}>
      <span style={{ color: '#9b9289', flex: 'none' }}>{label}</span>
      <span style={{ fontWeight: highlight ? 600 : 500, textAlign: 'right', fontFamily: mono ? 'monospace' : undefined, color: highlight || 'var(--ink)', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function PricingRow({ label, value, accent, total }) {
  if (total) return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #ECE3D5', paddingTop: 14, marginTop: 4 }}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>Tổng cộng</span>
      <span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--wood)' }}>{value}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, fontSize: 14 }}>
      <span style={{ color: accent ? '#1a7a45' : 'var(--muted)' }}>{label}</span>
      <span style={{ color: accent ? '#1a7a45' : 'var(--ink)', fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setOrder(null);
    setError('');
    api.get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => setError('Không thể tải đơn hàng. Vui lòng thử lại.'));
  }, [id]);

  if (error) return (
    <div className="container page-pad" style={{ paddingTop: 60, paddingBottom: 60, textAlign: 'center' }}>
      <p style={{ color: '#c0563f' }}>{error}</p>
      <Link to="/orders" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>Quay lại</Link>
    </div>
  );
  if (!order) return (
    <div className="container page-pad" style={{ paddingTop: 60, paddingBottom: 60, textAlign: 'center' }}>
      <p className="muted">Đang tải…</p>
    </div>
  );

  const p = order.pricing;
  const st = STATUS_MAP[order.orderStatus] || { color: '#9b9289', bg: '#f5f5f5', label: order.orderStatus };
  const cancelled = order.orderStatus === 'cancelled';
  const curStep = STEPS.indexOf(order.orderStatus);
  const ship = order.shipping || {};
  const pay = order.payment || {};

  // Map status → earliest statusHistory entry with that status
  const histMap = {};
  (order.statusHistory || []).forEach((h) => {
    if (!histMap[h.status]) histMap[h.status] = h;
  });

  return (
    <div>
      <div className="pagehead">
        <div className="container">
          <div className="crumb">
            <Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/orders">Đơn hàng</Link> / <b>{order.orderNumber}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <h1 className="serif" style={{ margin: 0 }}>{order.orderNumber}</h1>
            <span style={{ background: st.bg, color: st.color, fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 20 }}>● {st.label}</span>
          </div>
          <p className="muted" style={{ fontSize: 13, margin: '8px 0 0' }}>Đặt lúc {fmtDT(order.createdAt)}</p>
        </div>
      </div>

      <div className="container page-pad" style={{ paddingTop: 36, paddingBottom: 90, maxWidth: 1000 }}>

        {/* Status stepper */}
        {!cancelled && (
          <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: '24px 28px', marginBottom: 20, overflowX: 'auto' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 480 }}>
              {/* connector line behind circles */}
              <div style={{ position: 'absolute', top: 15, left: '10%', right: '10%', height: 2, background: '#F0E9DD', zIndex: 0 }} />
              {/* filled portion */}
              {curStep >= 0 && (
                <div style={{
                  position: 'absolute', top: 15, left: '10%', height: 2, background: 'var(--wood)', zIndex: 0,
                  width: curStep === 0 ? '0%' : `${(curStep / (STEPS.length - 1)) * 80}%`,
                  transition: 'width .4s ease',
                }} />
              )}
              {STEPS.map((s, i) => {
                const done = i <= curStep;
                const active = i === curStep;
                const hist = histMap[s];
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: done ? 'var(--wood)' : '#F0E9DD',
                      border: `2px solid ${done ? 'var(--wood)' : '#ddd'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: done ? '#fff' : '#bbb',
                      fontSize: done && !active ? 16 : 13,
                      fontWeight: 700,
                      boxShadow: active ? '0 0 0 4px rgba(139,107,74,.15)' : 'none',
                      transition: 'all .2s',
                    }}>
                      {done && !active ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: done ? 'var(--wood)' : '#bbb', marginTop: 8, textAlign: 'center', lineHeight: 1.4 }}>
                      {STEP_LABELS[s]}
                    </div>
                    {hist && (
                      <div style={{ fontSize: 10, color: '#9b9289', marginTop: 2, textAlign: 'center' }}>
                        {fmtDT(hist.updatedAt)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {cancelled && (
          <div style={{ background: '#FFF0EE', border: '1px solid #f5bfb4', borderRadius: 14, padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#c0563f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flex: 'none' }}>✕</div>
            <div>
              <div style={{ fontWeight: 600, color: '#c0563f', fontSize: 15 }}>Đơn hàng đã bị huỷ</div>
              {histMap.cancelled?.comment && (
                <div style={{ fontSize: 13, color: '#9b9289', marginTop: 2 }}>{histMap.cancelled.comment}</div>
              )}
              {histMap.cancelled?.updatedAt && (
                <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>Lúc {fmtDT(histMap.cancelled.updatedAt)}</div>
              )}
            </div>
          </div>
        )}

        <div className="acctgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div>

            {/* Items */}
            <Card title="Sản phẩm đã đặt">
              {order.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: i < order.items.length - 1 ? '1px solid #F3EDE3' : 'none' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 12, flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#f4e7cb,#DCC5A1)' }}>
                    {(it.imageUrl || it.image) && (
                      <img src={it.imageUrl || it.image} alt={it.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="serif" style={{ fontSize: 16, fontWeight: 600 }}>{it.productName}</div>
                    <div style={{ fontSize: 12, color: '#9b9289', marginTop: 3 }}>
                      {[it.sizeLabel, it.scentName].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ fontSize: 13, color: '#9b9289', marginTop: 3 }}>
                      {it.quantity} × {money(it.price)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--wood)' }}>{money(it.price * it.quantity)}</span>
                  </div>
                </div>
              ))}
            </Card>

            {/* Shipping info */}
            <Card title="Thông tin giao hàng">
              {!ship.recipientName && !ship.address ? (
                <div style={{ fontSize: 14, color: '#9b9289' }}>Chưa có thông tin giao hàng.</div>
              ) : (
                <div>
                  <InfoRow label="Người nhận" value={ship.recipientName} />
                  <InfoRow label="Số điện thoại" value={ship.recipientPhone} />
                  <InfoRow label="Địa chỉ" value={ship.address} />
                  {ship.carrier && <InfoRow label="Đơn vị vận chuyển" value={ship.carrier} />}
                  {ship.trackingNumber && <InfoRow label="Mã vận đơn" value={ship.trackingNumber} mono />}
                  {ship.estimatedDelivery && <InfoRow label="Dự kiến giao hàng" value={fmtD(ship.estimatedDelivery)} />}
                </div>
              )}
            </Card>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <Card title="Lịch sử trạng thái">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[...order.statusHistory].reverse().map((h, i, arr) => {
                    const hSt = STATUS_MAP[h.status] || { color: '#9b9289', label: h.status };
                    const isLatest = i === 0;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < arr.length - 1 ? 22 : 0 }}>
                        {/* vertical connector */}
                        {i < arr.length - 1 && (
                          <div style={{ position: 'absolute', left: 11, top: 25, bottom: 0, width: 2, background: '#F0E9DD' }} />
                        )}
                        {/* dot */}
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flex: 'none', marginTop: 2,
                          background: isLatest ? 'var(--wood)' : '#F0E9DD',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isLatest ? '#fff' : '#bbb' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isLatest ? hSt.color : 'var(--ink)' }}>
                            {hSt.label}
                          </div>
                          {h.comment && (
                            <div style={{ fontSize: 12, color: '#9b9289', marginTop: 2 }}>{h.comment}</div>
                          )}
                          <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>{fmtDT(h.updatedAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card title="Ghi chú đơn hàng">
                <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>{order.notes}</p>
              </Card>
            )}
          </div>

          {/* ── Right column ── */}
          <aside style={{ position: 'sticky', top: 98, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Order summary */}
            <div style={{ background: 'var(--soft)', border: '1px solid #F0E9DD', borderRadius: 18, padding: 24 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 18 }}>Tóm tắt đơn hàng</div>
              <PricingRow label="Tạm tính" value={money(p.subtotal)} />
              {p.discountAmount > 0 && (
                <PricingRow label={order.couponUsed?.code ? `Mã giảm giá (${order.couponUsed.code})` : 'Giảm giá'} value={'−' + money(p.discountAmount)} accent />
              )}
              <PricingRow label="Phí vận chuyển" value={p.shippingFee ? money(p.shippingFee) : 'Miễn phí'} />
              {p.taxAmount > 0 && <PricingRow label="Thuế" value={money(p.taxAmount)} />}
              <PricingRow total value={money(p.totalAmount)} />
            </div>

            {/* Payment info */}
            <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 24 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Thông tin thanh toán</div>
              <InfoRow label="Phương thức" value={PAY_METHOD[pay.method] || pay.method || 'COD'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#9b9289' }}>Trạng thái</span>
                <span style={{ fontWeight: 600, color: (PAY_STATUS[pay.status] || {}).color || '#9b9289' }}>
                  {(PAY_STATUS[pay.status] || { label: pay.status }).label}
                </span>
              </div>
              {pay.paidAt && <InfoRow label="Thanh toán lúc" value={fmtDT(pay.paidAt)} />}
              {pay.transactionId && pay.transactionId !== 'manual' && (
                <InfoRow label="Mã giao dịch" value={pay.transactionId} mono />
              )}
            </div>

            <Link to="/orders" style={{ display: 'block', textAlign: 'center', fontSize: 14, color: 'var(--wood)', fontWeight: 600, padding: '10px 0' }}>
              ← Quay lại đơn hàng
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
