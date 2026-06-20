import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

const SORT_OPTIONS = [
  { value: 'newest',     label: '🆕 Mới nhất' },
  { value: 'price_asc',  label: '💰 Giá tăng dần' },
  { value: 'price_desc', label: '💎 Giá giảm dần' },
  { value: 'name_asc',   label: '🔤 Tên A–Z' },
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

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ marginBottom: 6 }}>
          {category ? (categories.find((c) => c.slug === category)?.name || 'Sản phẩm') : 'Tất cả sản phẩm'}
        </h1>
        {!loading && (
          <p style={{ color: '#9b9289', fontSize: 14, margin: 0 }}>
            {data.total > 0 ? `${data.total} sản phẩm` : 'Không tìm thấy sản phẩm nào'}
            {q && <> cho "<strong style={{ color: '#2C2C2C' }}>{q}</strong>"</>}
          </p>
        )}
      </div>

      {/* Search + sort bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <input
            placeholder="Tìm kiếm sản phẩm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && update({ q: search })}
            style={{ paddingLeft: 36, width: '100%' }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9b9289', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
        </div>
        {search !== q && (
          <button className="btn btn-sm" onClick={() => update({ q: search })}>Tìm</button>
        )}
        {q && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); update({ q: '' }); }}>✕ Xóa tìm</button>
        )}
        <select value={sort} onChange={(e) => update({ sort: e.target.value })}
          style={{ width: 'auto', flexShrink: 0, fontSize: 14 }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category pill filters */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24, scrollbarWidth: 'none' }}>
          <button
            onClick={() => update({ category: '' })}
            style={{ padding: '7px 16px', borderRadius: 24, border: '1.5px solid', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: 13, transition: 'all .18s',
              borderColor: !category ? '#8B6B4A' : '#EFE8DC',
              background: !category ? '#8B6B4A' : '#fff',
              color: !category ? '#fff' : '#4a443c',
            }}>
            Tất cả
          </button>
          {categories.map((c) => (
            <button key={c._id} onClick={() => update({ category: c.slug })}
              style={{ padding: '7px 16px', borderRadius: 24, border: '1.5px solid', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: 13, transition: 'all .18s',
                borderColor: category === c.slug ? '#8B6B4A' : '#EFE8DC',
                background: category === c.slug ? '#8B6B4A' : '#fff',
                color: category === c.slug ? '#fff' : '#4a443c',
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #F0E9DD' }}>
              <div className="skeleton" style={{ aspectRatio: '1/1' }} />
              <div style={{ padding: '14px 16px' }}>
                <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🕯️</div>
          <p className="muted" style={{ fontSize: 16 }}>Không tìm thấy sản phẩm nào.</p>
          {(q || category) && (
            <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => { setSearch(''); update({ q: '', category: '' }); }}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {data.items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>← Trước</button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === data.totalPages || Math.abs(n - page) <= 1)
            .reduce((acc, n, i, arr) => {
              if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) => n === '…'
              ? <span key={`e${i}`} style={{ padding: '7px 4px', color: '#9b9289' }}>…</span>
              : <button key={n} className={n === page ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => update({ page: String(n) })}>{n}</button>
            )}
          <button className="btn btn-outline btn-sm" disabled={page >= data.totalPages} onClick={() => update({ page: String(page + 1) })}>Tiếp →</button>
        </div>
      )}
    </div>
  );
}
