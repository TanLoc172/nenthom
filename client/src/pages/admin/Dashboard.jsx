import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';
import { statusInfo } from '../../utils/orderStatus.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then((r) => setData(r.data)); }, []);
  if (!data) return <p>Đang tải…</p>;
  const s = data.summary;

  const growth = (cur, prev) => {
    if (!prev) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return <span style={{ fontSize: 12, color: pct >= 0 ? '#1a7a45' : '#c0392b' }}>{pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}%</span>;
  };

  const kpis = [
    ['Doanh thu hôm nay', formatVnd(s.todayRevenue), growth(s.todayRevenue, s.yesterdayRevenue), 'vs hôm qua'],
    ['Doanh thu tháng', formatVnd(s.monthRevenue), growth(s.monthRevenue, s.lastMonthRevenue), 'vs tháng trước'],
    ['Đơn hôm nay', s.todayOrders, null, 'đơn mới'],
    ['Tổng doanh thu', formatVnd(s.totalRevenueAllTime), null, `${s.totalOrders} đơn`],
  ];
  const minis = [
    ['Khách hàng', s.totalCustomers], ['Sản phẩm', s.totalProducts],
    ['Đơn chờ xử lý', s.pendingOrders], ['Review chờ duyệt', s.pendingReviews],
    ['Sắp hết hàng', s.lowStock], ['Lượt xem hôm nay', s.visitorsToday],
  ];
  const max = Math.max(1, ...data.dailyRevenue.map((d) => d.revenue));

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li className="active">Dashboard</li></ul>
          <h1>Tổng quan</h1>
        </div>
        <div className="muted" style={{ fontSize: 14 }}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      <div className="stats">
        {kpis.map(([l, v, g, sub]) => (
          <div className="stat" key={l}>
            <div className="l">{l}</div>
            <div className="v" style={{ margin: '4px 0' }}>{v}</div>
            <div className="muted" style={{ fontSize: 12 }}>{g} {sub}</div>
          </div>
        ))}
      </div>

      <div className="stats">
        {minis.map(([l, v]) => (
          <div className="stat" key={l}><div className="v" style={{ fontSize: 22 }}>{v}</div><div className="l">{l}</div></div>
        ))}
      </div>

      <div className="admin-split">
        <div className="acard">
          <div className="acard-header">📈 Doanh thu 7 ngày</div>
          <div className="acard-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
              {data.dailyRevenue.map((d) => (
                <div key={d.date} title={`${d.date}: ${formatVnd(d.revenue)} (${d.orders} đơn)`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{d.orders || ''}</div>
                  <div style={{ width: '60%', background: 'var(--grad-primary)', height: `${(d.revenue / max) * 100}%`, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                  <span style={{ fontSize: 10, marginTop: 6, color: 'var(--muted)' }}>{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="acard">
          <div className="acard-header">🔥 Top bán chạy</div>
          <div className="acard-body p0">
            <table className="table">
              <tbody>
                {data.bestSellers.map((b, i) => (
                  <tr key={b.name}><td style={{ width: 30, color: 'var(--muted)' }}>{i + 1}</td><td>{b.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{b.qty}</td></tr>
                ))}
                {data.bestSellers.length === 0 && <tr><td className="muted" style={{ padding: 20 }}>Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="acard" style={{ marginTop: 20 }}>
        <div className="acard-header" style={{ justifyContent: 'space-between' }}><span>🧾 Đơn hàng gần đây</span><Link to="/admin/orders" style={{ fontSize: 13 }}>Xem tất cả →</Link></div>
        <div className="acard-body p0">
          <table className="table">
            <thead><tr><th>Mã đơn</th><th>Ngày</th><th style={{ textAlign: 'right' }}>Tổng</th><th style={{ textAlign: 'center' }}>Trạng thái</th></tr></thead>
            <tbody>
              {data.recentOrders.map((o) => {
                const si = statusInfo(o.orderStatus);
                return (
                  <tr key={o._id}>
                    <td><Link to={`/admin/orders/${o._id}`} style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{o.orderNumber}</Link></td>
                    <td className="muted" style={{ fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(o.pricing.totalAmount)}</td>
                    <td style={{ textAlign: 'center' }}><span className={`badge-status ${si.css}`}>{si.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
