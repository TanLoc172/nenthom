import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  if (!data) return <p>Đang tải…</p>;
  if (!data.category) return <p>Không tìm thấy danh mục.</p>;

  return (
    <div>
      <h1 className="section-title">{data.category.name}</h1>
      <div className="grid">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
    </div>
  );
}
