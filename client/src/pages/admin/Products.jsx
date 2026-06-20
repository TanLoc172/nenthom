import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd } from '../../utils/format.js';

export default function AdminProducts() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const load = () => api.get('/admin/products', { params: { q, page } }).then((r) => setData(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const remove = async (id) => {
    if (!confirm('Xoá sản phẩm này?')) return;
    await api.delete(`/admin/products/${id}`); load();
  };

  const priceRange = (p) => {
    const prices = (p.variants || []).map((v) => v.price).filter((x) => x != null);
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? formatVnd(min) : `${formatVnd(min)} – ${formatVnd(max)}`;
  };
  const totalStock = (p) => (p.variants || []).reduce((s, v) => s + (v.stockQuantity || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Sản phẩm</li></ul>
          <h1>Quản lý sản phẩm</h1>
        </div>
        <div className="row">
          <a className="btn btn-outline btn-sm" href="/api/admin/export/products">⬇ Xuất Excel</a>
          <Link className="btn btn-sm" to="/admin/products/new">+ Thêm sản phẩm</Link>
        </div>
      </div>

      <div className="acard"><div className="acard-body">
        <div className="row" style={{ alignItems: 'center' }}>
          <input placeholder="Tìm theo tên…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} style={{ width: 260 }} />
          <button className="btn btn-sm" onClick={() => { setPage(1); load(); }}>Tìm</button>
          <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>Tổng <strong>{data.total}</strong> sản phẩm</span>
        </div>
      </div></div>

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr>
            <th>Sản phẩm</th><th>Danh mục</th><th style={{ textAlign: 'right' }}>Giá</th>
            <th style={{ textAlign: 'center' }}>Biến thể</th><th style={{ textAlign: 'center' }}>Tồn kho</th>
            <th style={{ textAlign: 'center' }}>Trạng thái</th><th></th>
          </tr></thead>
          <tbody>
            {data.items.map((p) => {
              const img = p.images?.[0] || p.variants?.[0]?.images?.[0];
              const stock = totalStock(p);
              return (
                <tr key={p._id}>
                  <td>
                    <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'nowrap' }}>
                      {img ? <img src={img} className="item-img" alt="" /> : <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕯️</div>}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {p.scentProfile?.scentName}
                          {p.isFeatured && <span className="tag" style={{ position: 'static', marginLeft: 6, padding: '1px 7px' }}>Nổi bật</span>}
                          {p.isNew && <span className="tag tag-new" style={{ position: 'static', marginLeft: 4, padding: '1px 7px' }}>Mới</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{p.category?.name || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{priceRange(p)}</td>
                  <td style={{ textAlign: 'center' }} className="muted">{p.variants?.length || 0}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`pay-badge ${stock === 0 ? 'pay-refunded' : stock <= 5 ? 'pay-unpaid' : 'pay-paid'}`}>{stock}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge-status ${p.isActive ? 'st-delivered' : 'st-cancelled'}`}>{p.isActive ? 'Hiển thị' : 'Ẩn'}</span>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                      <Link className="btn btn-outline btn-sm" to={`/admin/products/${p._id}`}>Sửa</Link>
                      <button className="btn btn-outline btn-sm" onClick={() => remove(p._id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có sản phẩm.</p>}
        {data.totalPages > 1 && (
          <div className="row" style={{ justifyContent: 'center', gap: 6, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === data.page ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setPage(n)}>{n}</button>
            ))}
          </div>
        )}
      </div></div>
    </div>
  );
}
