import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import { I } from '../icons.jsx';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'price_asc',  label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc',   label: 'Tên A–Z' },
];

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('q') || '');

  const q        = params.get('q') || '';
  const category = params.get('category') || '';
  const sort     = params.get('sort') || 'newest';
  const page     = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { q, category, sort, page, limit: 12 } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [q, category, sort, page]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.set('page', '1');
    setParams(next);
  };

  const clearAll = () => { setSearch(''); update({ q: '', category: '' }); };
  const catName = category ? (categories.find((c) => c.slug === category)?.name || 'Sản phẩm') : 'Tất cả sản phẩm';

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>{catName}</b></div>
        <h1 className="serif">{catName}</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0', maxWidth: 560 }}>Nến thơm thủ công từ tinh dầu thiên nhiên, được chế tác tỉ mỉ cho từng khoảnh khắc thư giãn.</p>
      </div></div>

      <div className="container" style={{ padding: '40px 32px 90px', display: 'grid', gridTemplateColumns: '262px 1fr', gap: 42, alignItems: 'start' }} id="listgrid">
        <aside style={{ position: 'sticky', top: 98 }} className="filters">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600 }}>Bộ lọc</div>
            <span className="tlink" style={{ fontSize: 12, color: 'var(--wood)', textDecoration: 'underline' }} onClick={clearAll}>Xóa lọc</span>
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 14 }}>Tìm kiếm</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="inp" placeholder="Tên sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && update({ q: search })} />
              <button className="btn btn-dark btn-sm" onClick={() => update({ q: search })}>Tìm</button>
            </div>
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 14 }}>Danh mục</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span onClick={() => update({ category: '' })} style={pillStyle(!category)}>Tất cả</span>
              {categories.map((c) => (
                <span key={c._id} onClick={() => update({ category: c.slug })} style={pillStyle(category === c.slug)}>{c.name}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', marginBottom: 14 }}>Sắp xếp</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SORT_OPTIONS.map((o) => (
                <span key={o.value} onClick={() => update({ sort: o.value })} style={{ cursor: 'pointer', fontSize: 13, padding: '9px 13px', borderRadius: 9, background: sort === o.value ? 'var(--cream)' : 'transparent', color: sort === o.value ? 'var(--wood)' : '#6f665c', fontWeight: sort === o.value ? 700 : 500 }}>{o.label}</span>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 26, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              <b style={{ color: 'var(--ink)' }}>{data.total}</b> sản phẩm{q && <span> cho “{q}”</span>}
            </div>
          </div>

          {loading ? (
            <div className="grid4">{Array.from({ length: 8 }).map((_, k) => (
              <div className="skcard" key={k}><div className="sk skimg"></div><div className="sk skline" style={{ width: '45%' }}></div><div className="sk skline" style={{ width: '80%', height: 18 }}></div><div className="sk skline" style={{ width: '60%' }}></div><div className="sk skline" style={{ width: '35%', marginTop: 16 }}></div></div>
            ))}</div>
          ) : data.items.length ? (
            <>
              <div className="grid4">{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
              {data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 48, flexWrap: 'wrap' }}>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
                    <span key={n} onClick={() => { update({ page: String(n) }); window.scrollTo(0, 0); }} style={{ minWidth: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 600, border: '1px solid ' + (n === page ? 'var(--wood)' : 'var(--line2)'), background: n === page ? 'var(--wood)' : '#fff', color: n === page ? '#fff' : 'var(--ink)' }}>{n}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '90px 20px', color: '#9b9289' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
              <div className="serif" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>Không tìm thấy sản phẩm</div>
              <p style={{ fontSize: 14, margin: '0 0 22px' }}>Thử điều chỉnh bộ lọc của bạn.</p>
              <button className="btn btn-primary btn-sm" onClick={clearAll}>Xóa bộ lọc</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function pillStyle(on) {
  return { cursor: 'pointer', fontSize: 13, padding: '9px 13px', borderRadius: 9, background: on ? 'var(--wood)' : '#fff', color: on ? '#fff' : 'var(--ink)', border: '1px solid ' + (on ? 'var(--wood)' : 'var(--line2)') };
}
