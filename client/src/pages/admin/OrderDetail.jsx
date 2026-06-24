import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';
import { ORDER_FLOW, ALL_STATUSES, statusInfo, paymentInfo } from '../../utils/orderStatus.js';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/orders/${id}`).then((r) => setO(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (!o) return <p>Đang tải…</p>;
  const si = statusInfo(o.orderStatus);
  const pi = paymentInfo(o.payment?.status);
  const cancelled = o.orderStatus === 'cancelled';
  const curIdx = ORDER_FLOW.indexOf(o.orderStatus);

  const updateStatus = async (status) => {
    setSaving(true);
    try { await api.put(`/admin/orders/${id}/status`, { status }); await load(); } finally { setSaving(false); }
  };
  const updatePayment = async (paymentStatus) => {
    setSaving(true);
    try { await api.put(`/admin/orders/${id}/status`, { paymentStatus }); await load(); } finally { setSaving(false); }
  };
  const confirmPayment = async () => {
    if (!window.confirm('Xác nhận đã nhận được tiền chuyển khoản?')) return;
    setSaving(true);
    try { await api.post(`/admin/orders/${id}/confirm-payment`); await load(); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li><Link to="/admin/orders">Đơn hàng</Link></li><li className="sep">/</li><li className="active">{o.orderNumber}</li></ul>
          <h1 style={{ fontFamily: 'monospace' }}>{o.orderNumber} <span className={`badge-status ${si.css}`} style={{ fontSize: 13, verticalAlign: 'middle' }}>{si.icon} {si.label}</span></h1>
        </div>
        <Link to="/admin/orders" className="btn btn-outline btn-sm">← Danh sách</Link>
      </div>

      {/* Progress */}
      {!cancelled && (
        <div className="acard"><div className="acard-body"><div className="step-bar">
          {ORDER_FLOW.map((s, i) => {
            const cls = curIdx > i ? 'done' : curIdx === i ? 'active' : '';
            return (
              <div key={s} style={{ display: 'contents' }}>
                <div className="step">
                  <div className={`step-icon ${cls}`}>{statusInfo(s).icon}</div>
                  <div className={`step-label ${cls}`}>{statusInfo(s).label}</div>
                </div>
                {i < ORDER_FLOW.length - 1 && <div className={`step-line ${curIdx > i ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div></div></div>
      )}

      <div className="admin-split">
        {/* LEFT */}
        <div>
          <div className="acard">
            <div className="acard-header">📦 Sản phẩm ({o.items.length})</div>
            <div className="acard-body p0">
              <table className="table">
                <thead><tr><th></th><th>Sản phẩm</th><th style={{ textAlign: 'center' }}>SL</th><th style={{ textAlign: 'right' }}>Đơn giá</th><th style={{ textAlign: 'right' }}>Thành tiền</th></tr></thead>
                <tbody>
                  {o.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.imageUrl ? <img src={it.imageUrl} className="item-img" alt="" /> : <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{it.productName}</div>
                        <div className="muted" style={{ fontSize: 12.5 }}>{it.sizeLabel}{it.scentName ? ` · ${it.scentName}` : ''} <span style={{ fontFamily: 'monospace' }}>{it.variantSku}</span></div>
                      </td>
                      <td style={{ textAlign: 'center' }}>×{it.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatVnd(it.price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: 'var(--bg-soft)' }}>
                  <tr><td colSpan={4} style={{ textAlign: 'right' }} className="muted">Tạm tính</td><td style={{ textAlign: 'right' }}>{formatVnd(o.pricing.subtotal)}</td></tr>
                  {o.pricing.discountAmount > 0 && <tr><td colSpan={4} style={{ textAlign: 'right', color: '#1a7a45' }}>Giảm giá{o.couponUsed?.code ? ` (${o.couponUsed.code})` : ''}</td><td style={{ textAlign: 'right', color: '#1a7a45', fontWeight: 600 }}>-{formatVnd(o.pricing.discountAmount)}</td></tr>}
                  {o.pricing.shippingFee > 0 && <tr><td colSpan={4} style={{ textAlign: 'right' }} className="muted">Phí vận chuyển</td><td style={{ textAlign: 'right' }}>{formatVnd(o.pricing.shippingFee)}</td></tr>}
                  <tr style={{ fontWeight: 700, fontSize: 16 }}><td colSpan={4} style={{ textAlign: 'right', color: 'var(--primary)' }}>Tổng cộng</td><td style={{ textAlign: 'right', color: 'var(--primary)' }}>{formatVnd(o.pricing.totalAmount)}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="acard">
            <div className="acard-header">🕘 Lịch sử trạng thái</div>
            <div className="acard-body">
              <div className="timeline">
                {[...(o.statusHistory || [])].reverse().map((h, i) => (
                  <div className="tl-item" key={i}>
                    <div className={`tl-dot ${i === 0 ? 'active' : ''}`} />
                    <div className="tl-time">{new Date(h.updatedAt).toLocaleString('vi-VN')}</div>
                    <div className="tl-label">{statusInfo(h.status).label}</div>
                    {h.comment && <div className="tl-comment">{h.comment}</div>}
                  </div>
                ))}
                {(!o.statusHistory || o.statusHistory.length === 0) && <p className="muted">Chưa có lịch sử.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="acard">
            <div className="acard-header">⚙️ Cập nhật</div>
            <div className="acard-body">
              <div className="field">
                <label>Trạng thái đơn</label>
                <select value={o.orderStatus} disabled={saving} onChange={(e) => updateStatus(e.target.value)}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusInfo(s).label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Thanh toán</label>
                <select value={o.payment?.status || 'unpaid'} disabled={saving} onChange={(e) => updatePayment(e.target.value)}>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="refunded">Hoàn tiền</option>
                </select>
              </div>
            </div>
          </div>

          <div className="acard">
            <div className="acard-header">👤 Khách hàng</div>
            <div className="acard-body">
              <div className="info-row"><span className="info-lbl">Người nhận</span><span>{o.shipping?.recipientName}</span></div>
              <div className="info-row"><span className="info-lbl">Điện thoại</span><span>{o.shipping?.recipientPhone}</span></div>
              <div className="info-row"><span className="info-lbl">Địa chỉ</span><span>{o.shipping?.address}</span></div>
              {o.guestEmail && <div className="info-row"><span className="info-lbl">Email</span><span>{o.guestEmail}</span></div>}
              {o.notes && <div className="info-row"><span className="info-lbl">Ghi chú</span><span>{o.notes}</span></div>}
            </div>
          </div>

          <div className="acard">
            <div className="acard-header">💳 Thanh toán</div>
            <div className="acard-body">
              <div className="info-row"><span className="info-lbl">Phương thức</span><span>{o.payment?.method}</span></div>
              <div className="info-row"><span className="info-lbl">Trạng thái</span><span className={`pay-badge ${pi.css}`}>{pi.label}</span></div>
              {o.payment?.transactionId && <div className="info-row"><span className="info-lbl">Mã GD</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.payment.transactionId}</span></div>}
              {o.payment?.paidAt && <div className="info-row"><span className="info-lbl">Ngày TT</span><span>{new Date(o.payment.paidAt).toLocaleString('vi-VN')}</span></div>}
              <div className="info-row"><span className="info-lbl">Đặt lúc</span><span>{new Date(o.createdAt).toLocaleString('vi-VN')}</span></div>
              {o.payment?.status !== 'paid' && o.payment?.method === 'VietQR' && (
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-sm" style={{ background: '#1a7a45', color: '#fff', border: 'none' }}
                    onClick={confirmPayment} disabled={saving}>
                    ✓ Xác nhận đã nhận tiền
                  </button>
                  <p style={{ fontSize: 11, color: '#9b9289', marginTop: 6 }}>
                    Dùng khi hệ thống tự động không nhận được từ Casso.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
