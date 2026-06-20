import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/wishlist').then((r) => setItems(r.data.items));
  }, []);

  return (
    <div>
      <h1 className="section-title">Sản phẩm yêu thích</h1>
      {items.length === 0 ? (
        <p className="muted">Chưa có sản phẩm yêu thích.</p>
      ) : (
        <div className="grid">{items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  );
}
