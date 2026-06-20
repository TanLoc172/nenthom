import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd, formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const load = (overrides = {}) => {
    const p = { q, page, ...overrides };
    return api.get('/admin/users', { params: p }).then((r) => setData(r.data)).catch(() => {});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const toggleAdmin = async (u) => {
    const roles = u.roles.includes('admin') ? u.roles.filter((r) => r !== 'admin') : [...u.roles, 'admin'];
    try { await api.put(`/admin/users/${u._id}`, { roles, status: u.status }); load(); } catch (err) { alert(err.message); }
  };
  const toggleStatus = async (u) => {
    try { await api.put(`/admin/users/${u._id}`, { roles: u.roles, status: u.status === 'active' ? 'banned' : 'active' }); load(); } catch (err) { alert(err.message); }
  };
  const name = (u) => [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') || u.email.split('@')[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Khách hàng</li></ul>
          <h1>Quản lý khách hàng</h1>
        </div>
        <div className="muted" style={{ fontSize: 14 }}>👥 Tổng <strong>{data.total}</strong> người dùng</div>
      </div>

      <div className="acard"><div className="acard-body">
        <div className="row" style={{ alignItems: 'center' }}>
          <input placeholder="Tìm email…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load({ q: e.target.value, page: 1 }))} style={{ width: 260 }} />
          <button className="btn btn-sm" onClick={() => { setPage(1); load({ page: 1 }); }}>Tìm</button>
        </div>
      </div></div>

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Người dùng</th><th>Liên hệ</th><th style={{ textAlign: 'center' }}>Quyền</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th style={{ textAlign: 'center' }}>Đơn</th><th style={{ textAlign: 'right' }}>Chi tiêu</th><th>Ngày tạo</th><th></th></tr></thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--grad-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{name(u).charAt(0).toUpperCase()}</div>
                    <div><div style={{ fontWeight: 600 }}>{name(u)}</div><div className="muted" style={{ fontSize: 12 }}>{u.profile?.gender || ''}</div></div>
                  </div>
                </td>
                <td><div style={{ fontSize: 13.5 }}>{u.email}</div><div className="muted" style={{ fontSize: 12.5 }}>{u.phone || '—'}</div></td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${u.roles.includes('admin') ? 'st-processing' : 'st-confirmed'}`}>{u.roles.includes('admin') ? 'Admin' : 'Khách'}</span></td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${u.status === 'active' ? 'st-delivered' : 'st-cancelled'}`}>{u.status === 'active' ? 'Hoạt động' : 'Khoá'}</span></td>
                <td style={{ textAlign: 'center' }}>{u.orderCount}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(u.totalSpent)}</td>
                <td className="muted" style={{ fontSize: 13 }}>{formatDate(u.createdAt)}</td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleAdmin(u)}>{u.roles.includes('admin') ? 'Bỏ admin' : 'Cấp admin'}</button>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(u)}>{u.status === 'active' ? 'Khoá' : 'Mở'}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Không có người dùng.</p>}
        {data.totalPages > 1 && (
          <div className="row" style={{ justifyContent: 'center', gap: 6, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => <button key={n} className={n === data.page ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setPage(n)}>{n}</button>)}
          </div>
        )}
      </div></div>
    </div>
  );
}
