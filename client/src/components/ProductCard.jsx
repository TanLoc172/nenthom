import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { I } from '../icons.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const variant = product.variants?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const img = product.images?.[0] || variant?.images?.[0];
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const badge = discount > 0 ? `-${discount}%` : product.isNew ? 'New' : product.isFeatured ? 'Best Seller' : null;

  const quickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem(product._id, variant.sku, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link to={`/products/${product.slug}`} className="pcard">
      <div className="imgwrap">
        <div className="candle" style={{ background: '#ece5da' }}>
          {img
            ? <img src={img} alt={product.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <><div className="jar"></div><div className="flame"></div></>}
        </div>
        {badge && <span className="pbadge">{badge}</span>}
        <span className={'wish' + (wished ? ' on' : '')} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished((w) => !w); }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#8B6B4A'} strokeWidth="1.7"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.7 3c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2C21.3 3 23.4 4.9 23.4 7.6c0 3.8-3.4 6.9-8.6 11.6L12 20.5z" /></svg>
        </span>
      </div>
      <div className="pinfo">
        <div className="stars">
          <span className="full">★★★★★</span>
          {product.reviewCount > 0 && <span className="muted" style={{ marginLeft: 3 }}>({product.reviewCount})</span>}
        </div>
        <div className="pname">{product.name}</div>
        {product.shortDescription
          ? <div className="pshort">{product.shortDescription}</div>
          : product.scentProfile?.scentName && <div className="pshort">{product.scentProfile.scentName}</div>}
        <div className="price-row">
          <div>
            <span className="price">{money(price)}</span>
            {discount > 0 && <span className="price-old">{money(compare)}</span>}
          </div>
          <button className="addbtn" title="Thêm vào giỏ" onClick={quickAdd} disabled={!variant || variant.stockQuantity < 1}
            style={added ? { background: 'var(--wood)', color: '#fff' } : null}>
            {added ? I.check : I.bagsm}
          </button>
        </div>
      </div>
    </Link>
  );
}
