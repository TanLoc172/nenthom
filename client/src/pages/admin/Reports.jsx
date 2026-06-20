import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';

export default function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [groupBy, setGroupBy] = useState('day');
  const [data, setData] = useState(null);

  const load = () => api.get('/admin/report', { params: { from, to, groupBy } }).then((r) => setData(r.data));
  useEffect(() => { load(); }, [groupBy]);

  const max = data ? Math.max(1, ...data.data.map((d) => d.revenue)) : 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Báo cáo</li></ul>
          <h1>Báo cáo & Thống kê</h1>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 16, alignItems: 'flex-end' }}>
        <div className="field"><label>Từ</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="field"><label>Đến</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="field"><label>Nhóm theo</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Ngày</option><option value="month">Tháng</option>
          </select>
        </div>
        <button className="btn" onClick={load}>Xem</button>
        <a className="btn btn-outline" href={`/api/admin/export/orders?from=${from}&to=${to}`}>Xuất Excel</a>
      </div>

      {!data ? <p>Đang tải…</p> : (
        <>
          <div className="stats">
            <div className="stat"><div className="v">{formatVnd(data.totalRevenue)}</div><div className="l">Tổng doanh thu</div></div>
            <div className="stat"><div className="v">{data.totalOrders}</div><div className="l">Tổng đơn</div></div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Biểu đồ doanh thu</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200, overflowX: 'auto' }}>
              {data.data.map((d) => (
                <div key={d.label} title={`${d.label}: ${formatVnd(d.revenue)}`} style={{ flex: '1 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ width: '70%', background: 'var(--primary)', height: `${(d.revenue / max) * 100}%`, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                  <span style={{ fontSize: 9, marginTop: 4, transform: 'rotate(-45deg)', whiteSpace: 'nowrap', color: 'var(--muted)' }}>{d.label.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          <h3>Top sản phẩm bán chạy</h3>
          <table className="table">
            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p.name}><td>{p.name}</td><td>{p.quantity}</td><td>{formatVnd(p.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
