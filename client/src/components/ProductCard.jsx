import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import { I } from '../icons.jsx';
import QuickView from './QuickView.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const variant = product.variants?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const img = product.images?.[0] || variant?.images?.[0];
  const img2 = product.images?.[1] || variant?.images?.[1];
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

  const openQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView(true);
  };

  return (
    <>
      <Link to={`/products/${product.slug}`} className="pcard">
        <div className="imgwrap" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div className="candle" style={{ background: '#ece5da' }}>
            {img
              ? <>
                  <img src={img} alt={product.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .4s ease', opacity: hovered && img2 ? 0 : 1 }} />
                  {img2 && <img src={img2} alt={product.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .4s ease', opacity: hovered ? 1 : 0 }} />}
                </>
              : <><div className="jar"></div><div className="flame"></div></>}
          </div>
          {badge && <span className="pbadge">{badge}</span>}
          {/* Quick view button — hiện khi hover */}
          <button className="qv-btn" onClick={openQuickView} title="Xem nhanh">Xem nhanh</button>
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

      {quickView && <QuickView slug={product.slug} onClose={() => setQuickView(false)} />}
    </>
  );
}
