import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';

export default function AdminInventory() {
  const [data, setData] = useState({ rows: [], stats: {}, lowThreshold: 5 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const load = () => api.get('/admin/inventory', { params: { search, status } }).then((r) => setData(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const updateStock = async (row, quantity) => {
    await api.put('/admin/inventory/stock', { productId: row.productId, sku: row.sku, quantity });
    load();
  };
  const s = data.stats;
  const low = data.lowThreshold || 5;

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Tồn kho</li></ul>
          <h1>Quản lý tồn kho</h1>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="v" style={{ fontSize: 22 }}>{s.totalSkus || 0}</div><div className="l">Tổng SKU</div></div>
        <div className="stat"><div className="v" style={{ fontSize: 22, color: '#1a7a45' }}>{s.inStock || 0}</div><div className="l">Còn hàng</div></div>
        <div className="stat"><div className="v" style={{ fontSize: 22, color: '#8a6200' }}>{s.lowStock || 0}</div><div className="l">Sắp hết</div></div>
        <div className="stat"><div className="v" style={{ fontSize: 22, color: '#c0392b' }}>{s.outOfStock || 0}</div><div className="l">Hết hàng</div></div>
        <div className="stat"><div className="v" style={{ fontSize: 20 }}>{formatVnd(s.totalStockValue)}</div><div className="l">Giá trị kho</div></div>
      </div>

      <div className="acard"><div className="acard-body">
        <div className="row" style={{ alignItems: 'center' }}>
          <input placeholder="Tìm tên / SKU…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} style={{ width: 240 }} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
            <option value="all">Tất cả</option><option value="in">Còn hàng</option><option value="low">Sắp hết</option><option value="out">Hết hàng</option>
          </select>
          <button className="btn btn-sm" onClick={load}>Lọc</button>
        </div>
      </div></div>

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Sản phẩm</th><th>SKU</th><th>Phiên bản</th><th style={{ textAlign: 'right' }}>Giá</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th style={{ textAlign: 'center', width: 160 }}>Tồn kho</th></tr></thead>
          <tbody>
            {data.rows.map((r) => {
              const st = r.stock === 0 ? ['Hết hàng', 'st-cancelled'] : r.stock <= low ? ['Sắp hết', 'st-pending'] : ['Còn hàng', 'st-delivered'];
              return (
                <tr key={r.productId + r.sku}>
                  <td>
                    <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
                      {r.image ? <img src={r.image} className="item-img" alt="" /> : <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕯️</div>}
                      <div><div style={{ fontWeight: 600 }}>{r.productName}</div><div className="muted" style={{ fontSize: 12 }}>{r.category}</div></div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.sku}</td>
                  <td className="muted">{r.sizeLabel}</td>
                  <td style={{ textAlign: 'right' }}>{formatVnd(r.price)}</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge-status ${st[1]}`}>{st[0]}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="number" defaultValue={r.stock} style={{ width: 90, textAlign: 'center' }}
                      onBlur={(e) => Number(e.target.value) !== r.stock && updateStock(r, Number(e.target.value))} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.rows.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Không có dữ liệu.</p>}
      </div></div>
    </div>
  );
}
