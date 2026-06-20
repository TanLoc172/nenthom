import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';
import { ALL_STATUSES, statusInfo, paymentInfo } from '../../utils/orderStatus.js';

export default function AdminOrders() {
  const [data, setData] = useState({ items: [], statusCounts: {}, totalAll: 0, totalPages: 1, page: 1 });
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const load = (overrides = {}) => {
    const p = { status, q, from, to, page, ...overrides };
    return api.get('/admin/orders', { params: p }).then((r) => setData(r.data)).catch(() => {});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, page]);

  const counts = data.statusCounts || {};
  const tabs = [['', 'Tất cả', data.totalAll || 0], ...ALL_STATUSES.map((s) => [s, statusInfo(s).label, counts[s] || 0])];

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Đơn hàng</li></ul>
          <h1>Quản lý đơn hàng</h1>
        </div>
        <div className="muted" style={{ fontSize: 14 }}>🧾 Tổng <strong>{data.totalAll || 0}</strong> đơn</div>
      </div>

      {/* Status tabs */}
      <div className="acard"><div className="acard-body p0"><div className="status-tabs">
        {tabs.map(([s, label, cnt]) => (
          <button key={s || 'all'} className={`status-tab ${status === s ? 'active' : ''}`} onClick={() => { setStatus(s); setPage(1); }}>
            {label} <span className="cnt">{cnt}</span>
          </button>
        ))}
      </div></div></div>

      {/* Filters */}
      <div className="acard"><div className="acard-body">
        <div className="row" style={{ alignItems: 'center' }}>
          <input placeholder="Mã đơn, tên, SĐT…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} style={{ width: 220 }} />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 160 }} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-sm" onClick={() => { setPage(1); load({ page: 1 }); }}>Lọc</button>
          {(q || from || to) && <button className="btn btn-outline btn-sm" onClick={() => { setQ(''); setFrom(''); setTo(''); setPage(1); load({ q: '', from: '', to: '', page: 1 }); }}>Xóa lọc</button>}
          <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>Hiển thị <strong>{data.total || 0}</strong> đơn</span>
        </div>
      </div></div>

      {/* Table */}
      <div className="acard"><div className="acard-body p0">
        {data.items.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Không tìm thấy đơn hàng nào.</p>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Mã đơn</th><th>Khách hàng</th><th style={{ textAlign: 'center' }}>SP</th>
              <th style={{ textAlign: 'right' }}>Tổng tiền</th><th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Thanh toán</th><th>Ngày đặt</th><th></th>
            </tr></thead>
            <tbody>
              {data.items.map((o) => {
                const si = statusInfo(o.orderStatus); const pi = paymentInfo(o.payment?.status);
                const qty = o.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                const dt = new Date(o.createdAt);
                return (
                  <tr key={o._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{o.orderNumber}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.shipping?.recipientName}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{o.shipping?.recipientPhone}</div>
                    </td>
                    <td style={{ textAlign: 'center' }} className="muted">{qty} sp</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatVnd(o.pricing?.totalAmount)}
                      {o.pricing?.discountAmount > 0 && <div style={{ fontSize: 11.5, color: '#1a7a45', fontWeight: 400 }}>-{formatVnd(o.pricing.discountAmount)}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}><span className={`badge-status ${si.css}`}>{si.label}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pay-badge ${pi.css}`}>{pi.label}</span>
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{o.payment?.method}</div>
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>{dt.toLocaleDateString('vi-VN')}<br /><span style={{ fontSize: 12 }}>{dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span></td>
                    <td><Link to={`/admin/orders/${o._id}`} className="btn btn-outline btn-sm">Xem</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {data.totalPages > 1 && (
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span className="muted" style={{ fontSize: 13 }}>Trang {data.page} / {data.totalPages}</span>
            <div className="row" style={{ gap: 6 }}>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map((n) => (
                <button key={n} className={n === data.page ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div></div>
    </div>
  );
}
