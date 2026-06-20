import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

const ACTION = { create: ['Tạo mới', 'st-delivered'], update: ['Cập nhật', 'st-confirmed'], delete: ['Xoá', 'st-cancelled'] };

export default function AdminAuditLog() {
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => { api.get('/admin/audit-logs', { params: { page } }).then((r) => setData(r.data)); }, [page]);

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Nhật ký</li></ul>
          <h1>Nhật ký hoạt động</h1>
        </div>
      </div>

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Thời gian</th><th style={{ textAlign: 'center' }}>Hành động</th><th>Đối tượng</th><th>Document</th><th>IP</th></tr></thead>
          <tbody>
            {data.items.map((l) => {
              const a = ACTION[l.action] || [l.action, 'st-pending'];
              return (
                <tr key={l._id}>
                  <td className="muted" style={{ fontSize: 13 }}>{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge-status ${a[1]}`}>{a[0]}</span></td>
                  <td style={{ fontWeight: 600 }}>{l.collectionName}</td>
                  <td className="muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.documentId || '—'}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{l.ipAddress}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có nhật ký.</p>}
        {data.totalPages > 1 && (
          <div className="row" style={{ justifyContent: 'center', gap: 6, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === page ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setPage(n)}>{n}</button>
            ))}
          </div>
        )}
      </div></div>
    </div>
  );
}
