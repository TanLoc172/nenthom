import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { q, category, sort, page, limit: 12 } })
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
      <h1 className="section-title">Sản phẩm</h1>
      <div className="row" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Tìm kiếm…"
          defaultValue={q}
          onKeyDown={(e) => e.key === 'Enter' && update({ q: e.target.value })}
        />
        <select value={category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A-Z</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải…</p>
      ) : data.items.length === 0 ? (
        <p className="muted">Không có sản phẩm nào.</p>
      ) : (
        <div className="grid">{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}

      {data.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={n === page ? 'btn' : 'btn btn-outline'}
              onClick={() => update({ page: String(n) })}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
