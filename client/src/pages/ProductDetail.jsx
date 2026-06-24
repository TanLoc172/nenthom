import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { money } from '../utils/format.js';
import useSeo from '../utils/useSeo.js';
import ProductCard from '../components/ProductCard.jsx';
import { I } from '../icons.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [gi, setGi] = useState(0);
  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [tab, setTab] = useState('desc');
  const [bundle, setBundle] = useState(null);

  const loadReviews = (productId) =>
    api.get(`/products/${productId}/reviews`).then((rr) => setReviews(rr.data)).catch(() => {});

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setBundle(null);
    setTab('desc');
    setQty(1);
    setGi(0);
    api.get(`/products/${slug}`).then((r) => {
      if (cancelled) return;
      setData(r.data);
      setVariant(r.data.product.variants?.[0] || null);
      loadReviews(r.data.product._id);
      api.get(`/bundles/by-product/${r.data.product._id}`)
        .then((rb) => { if (!cancelled) setBundle(rb.data); })
        .catch(() => {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  useSeo(data ? {
    title: data.product.name,
    description: data.product.shortDescription || data.product.description?.slice(0, 160),
    image: data.product.images?.[0],
    type: 'product',
  } : {});

  if (!data) return (
    <div style={{ padding: '90px 0', textAlign: 'center', color: '#9b9289' }}>
      <div className="spin" style={{ width: 42, height: 42, border: '3px solid #EFE8DC', borderTopColor: '#8B6B4A', borderRadius: '50%', margin: '0 auto 16px' }} />
      Đang tải…
    </div>
  );

  const { product, related } = data;
  const gallery = (product.images?.length ? product.images : (variant?.images || [])).slice(0, 5);
  const img = gallery[gi] || variant?.images?.[0] || product.images?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const stock = variant?.stockQuantity ?? 0;
  const lowStock = stock > 0 && stock <= 5;
  const avg = reviews.average || 0;

  const handleAdd = async () => {
    await addItem(product._id, variant.sku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };
  const buyNow = async () => { await addItem(product._id, variant.sku, qty); navigate('/checkout'); };

  const specs = [
    ['Mùi hương', product.scentProfile?.scentName || product.category?.name],
    ['Kích thước', variant?.sizeLabel],
    ['Trọng lượng', variant?.weightGrams ? variant.weightGrams + 'g' : null],
    ['Danh mục', product.category?.name],
  ].filter(([, v]) => v);

  return (
    <div>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 0 }}>
        <div className="crumb">
          <Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/products">Sản phẩm</Link>
          {product.category?.name && <> / <Link className="tlink" to={`/category/${product.category.slug}`}>{product.category.name}</Link></>}
          {' '}/ <b>{product.name}</b>
        </div>
      </div>

      <div className="container detail page-pad" style={{ paddingTop: 30, paddingBottom: 70, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 60, alignItems: 'start' }}>
        {/* Gallery */}
        <div style={{ position: 'sticky', top: 98, display: 'grid', gridTemplateColumns: gallery.length > 1 ? '84px 1fr' : '1fr', gap: 16 }} className="gallery">
          {gallery.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {gallery.map((g, k) => (
                <div key={k} onClick={() => setGi(k)} style={{ aspectRatio: '1/1', borderRadius: 11, cursor: 'pointer', overflow: 'hidden', border: '2px solid ' + (gi === k ? 'var(--wood)' : 'transparent'), padding: 2 }}>
                  <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                </div>
              ))}
            </div>
          )}
          <div className="candle big" style={{ background: '#ece5da', overflow: 'hidden', cursor: 'zoom-in' }}
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
              const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
              const imgEl = e.currentTarget.querySelector('img');
              if (imgEl) { imgEl.style.transformOrigin = `${x}% ${y}%`; imgEl.style.transform = 'scale(2)'; }
            }}
            onMouseLeave={e => {
              const imgEl = e.currentTarget.querySelector('img');
              if (imgEl) { imgEl.style.transform = 'scale(1)'; imgEl.style.transformOrigin = 'center'; }
            }}>
            {img
              ? <img src={img} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .15s ease, transform-origin 0s' }} />
              : <><div className="jar"></div><div className="flame"></div></>}
          </div>
        </div>

        {/* Info */}
        <div>
          {discount > 0 ? <span className="tag" style={{ marginBottom: 16 }}>-{discount}%</span> : product.isNew ? <span className="tag" style={{ marginBottom: 16 }}>New</span> : null}
          <h1 className="serif" style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 600, lineHeight: 1.08, margin: '10px 0 14px' }}>{product.name}</h1>

          {reviews.count > 0 && (
            <div onClick={() => setTab('reviews')} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, cursor: 'pointer' }}>
              <span className="stars" style={{ fontSize: 16 }}><span className="full">{'★'.repeat(Math.round(avg))}</span><span className="empty">{'★'.repeat(5 - Math.round(avg))}</span></span>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>{avg}/5 · {reviews.count} đánh giá</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <span className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--wood)' }}>{money(price)}</span>
            {discount > 0 && <span style={{ fontSize: 18, color: '#b7ada0', textDecoration: 'line-through' }}>{money(compare)}</span>}
          </div>

          {product.shortDescription && (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#4a443c', margin: '0 0 28px' }}>{product.shortDescription}</p>
          )}

          {/* Variant selector */}
          {product.variants?.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#4a443c' }}>Kích thước: <span style={{ color: 'var(--wood)' }}>{variant?.sizeLabel}</span></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.variants.map((v) => (
                  <span key={v.sku} onClick={() => { setVariant(v); setGi(0); }} className={'chip' + (v.sku === variant?.sku ? ' on' : '')} style={{ opacity: v.stockQuantity < 1 ? 0.45 : 1 }}>
                    {v.sizeLabel}{v.stockQuantity < 1 && ' (hết)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, padding: 22, background: 'var(--soft)', borderRadius: 16, marginBottom: 30 }}>
              {specs.map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9b9289', marginBottom: 3 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div></div>
              ))}
            </div>
          )}

          {lowStock && (
            <div style={{ background: '#fff8e0', border: '1px solid #f5d87c', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 13, color: '#8a6200', fontWeight: 600 }}>
              ⚡ Chỉ còn <strong>{stock}</strong> sản phẩm — đặt ngay kẻo hết!
            </div>
          )}
          {stock === 0 && variant && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5aaaa', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 13, color: '#8b1a1a', fontWeight: 600 }}>Sản phẩm hiện đang hết hàng</div>
          )}

          {/* Qty + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line2)', borderRadius: 12, overflow: 'hidden' }}>
              <span onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 46, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: 'var(--wood)' }}>−</span>
              <span style={{ width: 48, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{qty}</span>
              <span onClick={() => setQty((q) => q + 1)} style={{ width: 46, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: 'var(--wood)' }}>+</span>
            </div>
            <button className="btn btn-dark" style={{ flex: 1, height: 50 }} disabled={!variant || stock < 1} onClick={handleAdd}>
              {stock < 1 ? 'Hết hàng' : added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
          <button className="btn btn-primary btn-block" style={{ height: 50, marginBottom: 18 }} disabled={!variant || stock < 1} onClick={buyNow}>Mua ngay</button>

          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--muted)' }}>
            <span className="tlink" style={{ display: 'flex', alignItems: 'center', gap: 7, color: wished ? 'var(--wood)' : 'inherit' }} onClick={() => setWished((w) => !w)}>{I.heart}{wished ? 'Đã thích' : 'Yêu thích'}</span>
            <span className="tlink" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{I.share}Chia sẻ</span>
          </div>
        </div>
      </div>

      {/* Bundle Deal */}
      {bundle?.companions?.length > 0 && (
        <div className="container" style={{ paddingBottom: 56 }}>
          <BundleDeal main={product} companions={bundle.companions} discountPercent={bundle.discountPercent} label={bundle.label} addItem={addItem} />
        </div>
      )}

      {/* Tabs */}
      <div className="container" style={{ paddingBottom: 70 }}>
        <div style={{ display: 'flex', gap: 34, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
          {[['desc', 'Mô tả sản phẩm'], ['reviews', `Đánh giá (${reviews.count})`]].map(([key, label]) => (
            <span key={key} onClick={() => setTab(key)} style={{ cursor: 'pointer', padding: '16px 4px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid ' + (tab === key ? 'var(--wood)' : 'transparent'), color: tab === key ? 'var(--ink)' : '#9b9289' }}>{label}</span>
          ))}
        </div>

        <div style={{ padding: '34px 0', maxWidth: 760 }}>
          {tab === 'desc' && (
            <div style={{ color: '#4a443c', lineHeight: 1.85, fontSize: 15, whiteSpace: 'pre-line' }}>
              {product.description || product.shortDescription || <span className="muted">Chưa có mô tả chi tiết.</span>}
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              {reviews.count > 0 && (
                <div style={{ background: 'var(--soft)', borderRadius: 14, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="serif" style={{ fontSize: 52, fontWeight: 700, color: 'var(--wood)', lineHeight: 1 }}>{avg}</div>
                    <div style={{ color: 'var(--gold)', fontSize: 17, letterSpacing: 2, margin: '6px 0 4px' }}>{'★'.repeat(Math.round(avg))}</div>
                    <div style={{ fontSize: 12, color: '#9b9289' }}>/ 5 — {reviews.count} đánh giá</div>
                  </div>
                </div>
              )}

              {user ? (
                <ReviewForm productId={product._id} onDone={() => loadReviews(product._id)} />
              ) : (
                <div style={{ background: 'var(--soft)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#4a443c' }}>
                  <Link to="/login" style={{ color: 'var(--wood)', fontWeight: 600 }}>Đăng nhập</Link> để viết đánh giá
                </div>
              )}

              {reviews.reviews.map((rv) => (
                <div key={rv._id} style={{ borderBottom: '1px solid #EFE8DC', padding: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%,#dcc09a,#8B6B4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>K</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#2C2C2C' }}>Khách hàng</div>
                      <div style={{ color: 'var(--gold)', fontSize: 14 }}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</div>
                    </div>
                    {rv.isVerifiedPurchase && <span style={{ fontSize: 11, color: '#1a7a45', background: '#e8f9ef', padding: '2px 9px', borderRadius: 10, fontWeight: 600 }}>✓ Đã mua</span>}
                  </div>
                  <p style={{ margin: 0, color: '#4a443c', lineHeight: 1.7, fontSize: 14 }}>{rv.comment}</p>
                </div>
              ))}

              {reviews.reviews.length === 0 && (
                <p style={{ color: '#9b9289', textAlign: 'center', padding: '32px 0' }}>Chưa có đánh giá. {user ? 'Hãy là người đầu tiên!' : ''}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <div style={{ background: 'var(--cream)' }}>
          <div className="container" style={{ paddingTop: 72, paddingBottom: 72 }}>
            <h2 className="serif" style={{ fontSize: 36, fontWeight: 600, margin: '0 0 34px' }}>Sản phẩm liên quan</h2>
            <div className="grid4">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bundle Deal ── */
function BundleDeal({ main, companions, discountPercent = 10, label = 'Mua kèm tiết kiệm', addItem }) {
  const mainV = main.variants?.[0];
  const mainPrice = mainV?.price ?? 0;
  const mainImg = main.images?.[0] || mainV?.images?.[0];

  const [selected, setSelected] = useState(() => companions.map(c => c._id?.toString()));
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const pickedCompanions = companions.filter(c => selected.includes(c._id?.toString()));

  const companionTotal = pickedCompanions.reduce((sum, c) => {
    const v = c.variants?.[0];
    return sum + (v?.price ?? 0);
  }, 0);

  const originalTotal = mainPrice + companionTotal;
  const savedAmount   = Math.round(companionTotal * (discountPercent / 100));
  const bundleTotal   = originalTotal - savedAmount;
  const count = 1 + pickedCompanions.length;

  const handleAddAll = async () => {
    if (pickedCompanions.length === 0) return;
    setAdding(true);
    try {
      await addItem(main._id, mainV.sku, 1);
      for (const c of pickedCompanions) {
        const v = c.variants?.[0];
        if (v) await addItem(c._id, v.sku, 1);
      }
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch { }
    finally { setAdding(false); }
  };

  if (!mainV) return null;

  const ProductChip = ({ product, isMain, checked, onToggle }) => {
    const v = product.variants?.[0];
    const img = product.images?.[0] || v?.images?.[0];
    const price = v?.price ?? 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${checked || isMain ? 'var(--wood)' : 'var(--line2)'}`, background: checked || isMain ? '#FBF6EE' : '#fff', opacity: isMain ? 1 : 1, transition: 'all .18s', cursor: isMain ? 'default' : 'pointer', flex: '1 1 220px' }}
        onClick={isMain ? undefined : onToggle}
      >
        {/* Checkbox / Lock */}
        {isMain ? (
          <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--wood)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        ) : (
          <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? 'var(--wood)' : '#d4cabc'}`, background: checked ? 'var(--wood)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
            {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </span>
        )}
        {/* Image */}
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: '#EFE8DC', flexShrink: 0 }}>
          {img ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🕯️</div>}
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2C2C2C', lineHeight: 1.3, marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: 'var(--wood)', fontWeight: 700 }}>{money(price)}</div>
          {!isMain && (
            <div style={{ fontSize: 11, color: '#1a7a45', marginTop: 2 }}>Tiết kiệm {Math.round(price * (discountPercent / 100)).toLocaleString('vi-VN')}₫</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: '1.5px solid var(--line2)', borderRadius: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg,#8B6B4A 0%,#a07d5a 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18 }}>🎁</span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: .2 }}>{label}</div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 1 }}>Chọn sản phẩm bên dưới để nhận giảm {discountPercent}% khi mua cùng</div>
        </div>
      </div>

      <div style={{ padding: '20px 24px 24px', background: '#fff' }}>
        {/* Product chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <ProductChip product={main} isMain checked />
          {companions.map(c => (
            <ProductChip key={c._id} product={c} isMain={false} checked={selected.includes(c._id?.toString())} onToggle={() => toggle(c._id?.toString())} />
          ))}
        </div>

        {/* Divider with arrow summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line2)' }} />
          <span style={{ fontSize: 13, color: '#9b9289', whiteSpace: 'nowrap' }}>
            {count} sản phẩm được chọn
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--line2)' }} />
        </div>

        {/* Price summary + CTA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span className="serif" style={{ fontSize: 28, fontWeight: 700, color: 'var(--wood)' }}>{money(bundleTotal)}</span>
              {savedAmount > 0 && <span style={{ fontSize: 15, color: '#9b9289', textDecoration: 'line-through' }}>{money(originalTotal)}</span>}
            </div>
            {savedAmount > 0 ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f9ef', border: '1px solid #b7e4c7', borderRadius: 8, padding: '4px 12px', fontSize: 13, color: '#1a7a45', fontWeight: 700 }}>
                ✓ Tiết kiệm {money(savedAmount)} khi mua kèm
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#9b9289' }}>Chọn thêm sản phẩm để nhận ưu đãi</div>
            )}
          </div>
          <button
            onClick={handleAddAll}
            disabled={adding || pickedCompanions.length === 0}
            style={{ padding: '13px 32px', borderRadius: 50, border: 'none', background: done ? '#1a7a45' : pickedCompanions.length === 0 ? '#d4cabc' : 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: pickedCompanions.length === 0 ? 'not-allowed' : 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
            {done ? '✓ Đã thêm vào giỏ' : adding ? 'Đang thêm…' : `Thêm ${count} SP vào giỏ`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ productId, onDone }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setDone(true);
      setComment('');
      onDone?.();
    } catch (err) { setError(err.message); }
  };

  if (done) return (
    <div style={{ background: '#e8f9ef', border: '1px solid #b7e4c7', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: '#1a7a45', fontWeight: 600, fontSize: 14 }}>
      ✓ Cảm ơn! Đánh giá của bạn đang chờ duyệt.
    </div>
  );

  return (
    <form onSubmit={submit} style={{ background: 'var(--soft)', borderRadius: 16, padding: '22px 24px', marginBottom: 28 }}>
      <div className="serif" style={{ fontWeight: 600, marginBottom: 16, fontSize: 20, color: '#2C2C2C' }}>Viết đánh giá của bạn</div>
      <label className="field"><span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Chọn số sao</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= (hover || rating) ? 'var(--gold)' : '#dcd2c2', transition: 'color .12s', padding: '0 3px', lineHeight: 1 }}>★</button>
          ))}
        </div>
      </label>
      <label className="field" style={{ marginTop: 14 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>Nhận xét</span>
        <textarea className="inp" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required placeholder="Chia sẻ cảm nhận về hương thơm, thời gian cháy, đóng gói…" />
      </label>
      {error && <p className="error" style={{ color: '#c0563f', fontSize: 13 }}>{error}</p>}
      <button className="btn btn-primary" style={{ marginTop: 14 }}>Gửi đánh giá</button>
    </form>
  );
}
