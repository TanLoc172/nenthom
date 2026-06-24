import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';

export default function QuickView({ slug, onClose }) {
  const { addItem } = useCart();
  const [data, setData] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    api.get(`/products/${slug}`).then(r => {
      if (cancelled) return;
      setData(r.data);
      setVariant(r.data.product.variants?.[0] || null);
    }).catch(() => {});

    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [slug]);

  const handleAdd = async () => {
    if (!variant) return;
    await addItem(data.product._id, variant.sku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const product = data?.product;
  const images = product ? [...(product.images || []), ...(variant?.images || [])].filter((v, i, a) => a.indexOf(v) === i) : [];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const stock = variant?.stockQuantity ?? 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.52)', backdropFilter: 'blur(3px)' }} />

      {/* Modal */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f5f0ea', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a443c' }}>×</button>

        {/* Images */}
        <div style={{ background: '#F5EFE6', borderRadius: '20px 0 0 20px', display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}>
          <div style={{ aspectRatio: '1/1', borderRadius: 14, overflow: 'hidden', background: '#ece5da' }}>
            {images[imgIdx]
              ? <img src={images[imgIdx]} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%' }} />}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIdx ? '#8B6B4A' : 'transparent'}`, flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        {!product ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#9b9289' }}>Đang tải…</div>
        ) : (
          <div style={{ padding: '28px 28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9b9289' }}>
              <span style={{ color: '#D9A441', letterSpacing: 1 }}>★★★★★</span>
              {product.reviewCount > 0 && <span>({product.reviewCount} đánh giá)</span>}
            </div>

            {/* Name */}
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#2C2C2C', lineHeight: 1.3 }}>{product.name}</h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#8B6B4A' }}>{money(price)}</span>
              {discount > 0 && <>
                <span style={{ fontSize: 14, color: '#bbb', textDecoration: 'line-through' }}>{money(compare)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, background: '#c0563f', color: '#fff', borderRadius: 6, padding: '2px 8px' }}>-{discount}%</span>
              </>}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ margin: 0, fontSize: 13.5, color: '#6b6560', lineHeight: 1.6, maxHeight: 130, overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: product.description }} />
            )}

            {/* Variants */}
            {product.variants?.length > 1 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b6560', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>Phân loại</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.variants.map((v) => (
                    <button key={v.sku} onClick={() => { setVariant(v); setImgIdx(0); }}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${variant?.sku === v.sku ? '#8B6B4A' : '#EDE5D8'}`, background: variant?.sku === v.sku ? '#FBF6EE' : '#fff', color: variant?.sku === v.sku ? '#8B6B4A' : '#4a443c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {v.name || v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #EDE5D8', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 42, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#8B6B4A' }}>−</button>
                <span style={{ width: 36, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock || 99, q + 1))} style={{ width: 40, height: 42, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#8B6B4A' }}>+</button>
              </div>
              {stock > 0
                ? <span style={{ fontSize: 12, color: '#4a7a3e' }}>Còn {stock} sản phẩm</span>
                : <span style={{ fontSize: 12, color: '#c0563f' }}>Hết hàng</span>}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button onClick={handleAdd} disabled={!variant || stock < 1}
                style={{ height: 46, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: added ? '#4a7a3e' : 'linear-gradient(135deg,#9c7a55,#765939)', color: '#fff', transition: 'background .25s' }}>
                {added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
              </button>
              <Link to={`/products/${product.slug}`} onClick={onClose}
                style={{ height: 44, borderRadius: 10, border: '1.5px solid #EDE5D8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#4a443c', textDecoration: 'none' }}>
                Xem chi tiết →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: stack columns */}
      <style>{`@media(max-width:600px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}div[style*="border-radius: 20px 0 0 20px"]{border-radius:20px 20px 0 0!important}}`}</style>
    </div>
  );
}
