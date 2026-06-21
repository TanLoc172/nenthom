import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/wishlist').then((r) => setItems(r.data.items));
  }, []);

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Yêu thích</b></div>
        <h1 className="serif">Sản phẩm yêu thích</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0' }}>{items.length} sản phẩm đã lưu</p>
      </div></div>

      <div className="container" style={{ padding: '48px 32px 90px' }}>
        {items.length ? (
          <div className="grid4">{items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        ) : (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: '#9b9289' }}>
            <div style={{ fontSize: 54, marginBottom: 16 }}>🤍</div>
            <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 8 }}>Danh sách yêu thích trống</div>
            <p style={{ fontSize: 14, margin: '0 0 26px' }}>Lưu lại những hương thơm bạn yêu thích để mua sau.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Khám phá sản phẩm</Link>
          </div>
        )}
      </div>
    </div>
  );
}
