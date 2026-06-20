import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatVnd } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const variant = product.variants?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const img = product.images?.[0] || variant?.images?.[0];
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;

  const quickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem(product._id, variant.sku, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-img">
        {img ? <img src={img} alt={product.name} loading="lazy" /> : <div className="ph" />}
        {discount > 0 ? <span className="tag">-{discount}%</span> : product.isNew && <span className="tag tag-new">Mới</span>}
        <div className="card-quick">
          <button className="btn btn-sm" onClick={quickAdd} disabled={!variant || variant.stockQuantity < 1}>
            {variant?.stockQuantity < 1 ? 'Hết hàng' : added ? '✓ Đã thêm' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        {product.scentProfile?.scentName && <span className="muted" style={{ fontSize: 13 }}>{product.scentProfile.scentName}</span>}
        <div className="price-row">
          <span className="price">{formatVnd(price)}</span>
          {discount > 0 && <span className="compare">{formatVnd(compare)}</span>}
        </div>
      </div>
    </Link>
  );
}
