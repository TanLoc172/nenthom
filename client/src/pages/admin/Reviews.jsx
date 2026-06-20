import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

const STATUS = { pending: ['Chờ duyệt', 'st-pending'], approved: ['Đã duyệt', 'st-delivered'], rejected: ['Từ chối', 'st-cancelled'] };

export default function AdminReviews() {
  const [data, setData] = useState({ items: [], statusCounts: {} });
  const [status, setStatus] = useState('pending');

  const load = () => api.get('/admin/reviews', { params: status ? { status } : {} }).then((r) => setData(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const moderate = async (id, s) => { await api.put(`/admin/reviews/${id}`, { status: s }); load(); };
  const remove = async (id) => { if (confirm('Xoá đánh giá?')) { await api.delete(`/admin/reviews/${id}`); load(); } };
  const c = data.statusCounts || {};
  const tabs = [['pending', 'Chờ duyệt', c.pending || 0], ['approved', 'Đã duyệt', c.approved || 0], ['rejected', 'Từ chối', c.rejected || 0], ['', 'Tất cả', (c.pending || 0) + (c.approved || 0) + (c.rejected || 0)]];
  const uname = (u) => [u?.profile?.firstName, u?.profile?.lastName].filter(Boolean).join(' ') || u?.email?.split('@')[0] || 'Khách';

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Đánh giá</li></ul>
          <h1>Duyệt đánh giá</h1>
        </div>
      </div>

      <div className="acard"><div className="acard-body p0"><div className="status-tabs">
        {tabs.map(([s, l, n]) => <button key={s || 'all'} className={`status-tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{l} <span className="cnt">{n}</span></button>)}
      </div></div></div>

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Sản phẩm</th><th>Nội dung</th><th>Người đánh giá</th><th style={{ textAlign: 'center' }}>Sao</th><th>Ngày</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th style={{ textAlign: 'center' }}>Thao tác</th></tr></thead>
          <tbody>
            {data.items.map((r) => {
              const [lbl, css] = STATUS[r.status] || ['—', 'st-pending'];
              return (
                <tr key={r._id}>
                  <td>{r.productId ? <Link to={`/products/${r.productId.slug}`} style={{ fontWeight: 600 }}>{r.productId.name}</Link> : <span className="muted">(đã xoá)</span>}</td>
                  <td style={{ maxWidth: 320 }}>{r.title && <strong>{r.title}<br /></strong>}<span className="muted">{r.comment}</span></td>
                  <td style={{ fontSize: 13 }}>{uname(r.userId)} {r.isVerifiedPurchase && <span className="pay-badge pay-paid">✓ Đã mua</span>}</td>
                  <td style={{ textAlign: 'center', color: '#f5a623', whiteSpace: 'nowrap' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{formatDate(r.createdAt)}</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge-status ${css}`}>{lbl}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="row" style={{ gap: 5, justifyContent: 'center', flexWrap: 'nowrap' }}>
                      {r.status !== 'approved' && <button className="btn btn-outline btn-sm" onClick={() => moderate(r._id, 'approved')}>Duyệt</button>}
                      {r.status !== 'rejected' && <button className="btn btn-outline btn-sm" onClick={() => moderate(r._id, 'rejected')}>Từ chối</button>}
                      <button className="btn btn-outline btn-sm" onClick={() => remove(r._id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Không có đánh giá.</p>}
      </div></div>
    </div>
  );
}
