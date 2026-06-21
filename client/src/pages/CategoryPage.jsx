import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import useSeo from '../utils/useSeo.js';
import ProductCard from '../components/ProductCard.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/categories/${slug}`).then((r) => setData(r.data)).catch(() => setData({ category: null, products: [] }));
  }, [slug]);

  useSeo(data?.category ? { title: data.category.name, description: data.category.description } : {});

  if (!data) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Đang tải…</p></div>;
  if (!data.category) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Không tìm thấy danh mục.</p></div>;

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/products">Sản phẩm</Link> / <b>{data.category.name}</b></div>
        <h1 className="serif">{data.category.name}</h1>
        {data.category.description && <p className="muted" style={{ fontSize: 14, margin: '8px 0 0', maxWidth: 560 }}>{data.category.description}</p>}
      </div></div>
      <div className="container" style={{ padding: '48px 32px 90px' }}>
        {data.products.length ? (
          <div className="grid4">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        ) : (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: '#9b9289' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🕯️</div>
            <div className="serif" style={{ fontSize: 24, color: 'var(--ink)' }}>Chưa có sản phẩm trong danh mục này</div>
          </div>
        )}
      </div>
    </div>
  );
}
