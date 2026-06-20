import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVnd } from '../utils/format.js';
import useSeo from '../utils/useSeo.js';
import ProductCard from '../components/ProductCard.jsx';

const TRUST = [
  { icon: '🌿', text: '100% tinh dầu thiên nhiên' },
  { icon: '🚚', text: 'Miễn phí giao từ 500.000₫' },
  { icon: '🔄', text: 'Đổi trả trong 7 ngày' },
  { icon: '🎁', text: 'Gói quà miễn phí' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('desc');

  const loadReviews = (productId) =>
    api.get(`/products/${productId}/reviews`).then((rr) => setReviews(rr.data)).catch(() => {});

  useEffect(() => {
    setData(null);
    setTab('desc');
    setQty(1);
    api.get(`/products/${slug}`).then((r) => {
      setData(r.data);
      setVariant(r.data.product.variants?.[0] || null);
      loadReviews(r.data.product._id);
    }).catch(() => {});
  }, [slug]);

  useSeo(data ? {
    title: data.product.name,
    description: data.product.shortDescription || data.product.description?.slice(0, 160),
    image: data.product.images?.[0],
    type: 'product',
  } : {});

  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center', color: '#9b9289' }}>
      <div style={{ width: 42, height: 42, border: '3px solid #EFE8DC', borderTopColor: '#8B6B4A', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
      Đang tải…
    </div>
  );

  const { product, related } = data;
  const img = variant?.images?.[0] || product.images?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const stock = variant?.stockQuantity ?? 0;
  const lowStock = stock > 0 && stock <= 5;

  const handleAdd = async () => {
    await addItem(product._id, variant.sku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#9b9289', marginBottom: 28, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#9b9289' }}>Trang chủ</Link>
        <span>›</span>
        <Link to="/products" style={{ color: '#9b9289' }}>Sản phẩm</Link>
        {product.category?.name && (
          <><span>›</span><Link to={`/category/${product.category.slug}`} style={{ color: '#9b9289' }}>{product.category.name}</Link></>
        )}
        <span>›</span>
        <span style={{ color: '#2C2C2C', fontWeight: 500 }}>{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="detail" style={{ gap: 56, alignItems: 'start' }}>
        {/* Image */}
        <div style={{ position: 'sticky', top: 88 }}>
          {img
            ? <img src={img} alt={product.name} style={{ width: '100%', borderRadius: 20, boxShadow: '0 22px 64px rgba(43,35,32,.16)' }} />
            : <div style={{ width: '100%', aspectRatio: '1/1', background: 'linear-gradient(135deg,#f0e6d3,#d4b896)', borderRadius: 20 }} />}
        </div>

        {/* Info */}
        <div>
          {product.category?.name && (
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#8B6B4A', marginBottom: 10 }}>
              {product.category.name}
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2, color: '#2C2C2C' }}>
            {product.name}
          </h1>

          {/* Stars */}
          {reviews.count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }} onClick={() => setTab('reviews')} role="button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ color: '#D9A441', fontSize: 15, letterSpacing: 1 }}>{'★'.repeat(Math.round(reviews.average))}{'☆'.repeat(5 - Math.round(reviews.average))}</span>
              <span style={{ fontSize: 13, color: '#9b9289', textDecoration: 'underline', cursor: 'pointer' }}>{reviews.average}/5 ({reviews.count} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '0 0 6px' }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: '#8B6B4A', fontFamily: 'system-ui, sans-serif' }}>{formatVnd(price)}</span>
            {discount > 0 && (
              <>
                <span style={{ fontSize: 16, color: '#b7ada0', textDecoration: 'line-through' }}>{formatVnd(compare)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, background: '#8B6B4A', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>−{discount}%</span>
              </>
            )}
          </div>
          {discount > 0 && (
            <p style={{ fontSize: 13, color: '#1a7a45', margin: '0 0 18px', fontWeight: 500 }}>Tiết kiệm {formatVnd(compare - price)}</p>
          )}

          {product.shortDescription && (
            <p style={{ color: '#4a443c', lineHeight: 1.75, margin: '18px 0 22px', fontSize: 15 }}>{product.shortDescription}</p>
          )}

          {/* Variant selector — pill buttons */}
          {product.variants?.length > 1 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#4a443c' }}>
                Kích thước: <span style={{ color: '#8B6B4A' }}>{variant?.sizeLabel}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.variants.map((v) => (
                  <button key={v.sku} onClick={() => setVariant(v)}
                    style={{
                      padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all .18s',
                      border: v.sku === variant?.sku ? '2px solid #8B6B4A' : '1.5px solid #EFE8DC',
                      background: v.sku === variant?.sku ? 'rgba(139,107,74,.09)' : '#fff',
                      color: v.sku === variant?.sku ? '#8B6B4A' : '#4a443c',
                      opacity: v.stockQuantity < 1 ? 0.45 : 1,
                    }}>
                    {v.sizeLabel}
                    {v.stockQuantity < 1 && ' (hết)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Low stock urgency */}
          {lowStock && (
            <div style={{ background: '#fff8e0', border: '1px solid #f5d87c', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 13, color: '#8a6200', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
              ⚡ Chỉ còn <strong>{stock}</strong> sản phẩm — đặt ngay kẻo hết!
            </div>
          )}
          {stock === 0 && variant && (
            <div style={{ background: '#fde8e8', border: '1px solid #f5aaaa', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 13, color: '#8b1a1a', fontWeight: 600 }}>
              Sản phẩm hiện đang hết hàng
            </div>
          )}

          {/* Qty + Add to cart */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #EFE8DC', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ width: 42, height: 50, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#4a443c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ width: 38, textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#2C2C2C' }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}
                style={{ width: 42, height: 50, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#4a443c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button className="btn" disabled={!variant || stock < 1} onClick={handleAdd}
              style={{ flex: 1, padding: '14px 24px', fontSize: 15, borderRadius: 10, letterSpacing: .2, transition: 'all .25s' }}>
              {stock < 1 ? 'Hết hàng' : added ? '✓ Đã thêm vào giỏ!' : '🛍 Thêm vào giỏ hàng'}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {TRUST.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4a443c', background: '#F5EFE6', borderRadius: 9, padding: '9px 12px' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Scent / extra info */}
          {product.scentProfile?.scentName && (
            <div style={{ fontSize: 13, color: '#9b9289', borderTop: '1px solid #EFE8DC', paddingTop: 16 }}>
              🌿 Mùi hương: <strong style={{ color: '#4a443c' }}>{product.scentProfile.scentName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Tab section */}
      <div style={{ marginTop: 56 }}>
        <div className="ptab-nav">
          {[['desc', 'Mô tả sản phẩm'], ['reviews', `Đánh giá (${reviews.count})`]].map(([key, label]) => (
            <button key={key} className={`ptab-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {tab === 'desc' && (
          <div style={{ color: '#4a443c', lineHeight: 1.85, fontSize: 15, whiteSpace: 'pre-line', maxWidth: 700, paddingTop: 8 }}>
            {product.description || product.shortDescription || <span className="muted">Chưa có mô tả chi tiết.</span>}
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ maxWidth: 720 }}>
            {reviews.count > 0 && (
              <div style={{ background: '#F5EFE6', borderRadius: 14, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 52, fontWeight: 700, color: '#8B6B4A', lineHeight: 1, fontFamily: 'Georgia, serif' }}>{reviews.average}</div>
                  <div style={{ color: '#D9A441', fontSize: 17, letterSpacing: 2, margin: '6px 0 4px' }}>{'★'.repeat(Math.round(reviews.average))}</div>
                  <div style={{ fontSize: 12, color: '#9b9289' }}>/ 5 — {reviews.count} đánh giá</div>
                </div>
              </div>
            )}

            {user ? (
              <ReviewForm productId={product._id} onDone={() => loadReviews(product._id)} />
            ) : (
              <div style={{ background: '#F5EFE6', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#4a443c' }}>
                <Link to="/login" style={{ color: '#8B6B4A', fontWeight: 600 }}>Đăng nhập</Link> để viết đánh giá
              </div>
            )}

            {reviews.reviews.map((rv) => (
              <div key={rv._id} style={{ borderBottom: '1px solid #EFE8DC', padding: '20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#DCC5A1,#8B6B4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    K
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2C2C2C' }}>Khách hàng</div>
                    <div style={{ color: '#D9A441', fontSize: 14 }}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</div>
                  </div>
                  {rv.isVerifiedPurchase && (
                    <span style={{ fontSize: 11, color: '#1a7a45', background: '#e8f9ef', padding: '2px 9px', borderRadius: 10, fontWeight: 600 }}>✓ Đã mua</span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#4a443c', lineHeight: 1.7, fontSize: 14 }}>{rv.comment}</p>
              </div>
            ))}

            {reviews.reviews.length === 0 && (
              <p style={{ color: '#9b9289', textAlign: 'center', padding: '32px 0' }}>
                Chưa có đánh giá. {user ? 'Hãy là người đầu tiên!' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <section style={{ marginTop: 72 }}>
          <h2 className="section-title">Sản phẩm liên quan</h2>
          <div className="grid">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
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
    <form onSubmit={submit} style={{ background: '#F5EFE6', borderRadius: 16, padding: '22px 24px', marginBottom: 28 }}>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: '#2C2C2C' }}>Viết đánh giá của bạn</div>
      <div className="field">
        <label>Chọn số sao</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= (hover || rating) ? '#D9A441' : '#dcd2c2', transition: 'color .12s', padding: '0 3px', lineHeight: 1 }}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Nhận xét</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required
          placeholder="Chia sẻ cảm nhận về hương thơm, thời gian cháy, đóng gói…" />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn">Gửi đánh giá</button>
    </form>
  );
}
