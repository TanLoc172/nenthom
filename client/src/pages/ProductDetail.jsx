import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatVnd } from '../utils/format.js';
import useSeo from '../utils/useSeo.js';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setData(null);
    api.get(`/products/${slug}`).then((r) => {
      setData(r.data);
      setVariant(r.data.product.variants?.[0] || null);
      api.get(`/products/${r.data.product._id}/reviews`).then((rr) => setReviews(rr.data)).catch(() => {});
    });
  }, [slug]);

  useSeo(data ? {
    title: data.product.name,
    description: data.product.shortDescription || data.product.description?.slice(0, 160),
    image: data.product.images?.[0],
    type: 'product',
  } : {});

  if (!data) return <p>Đang tải…</p>;
  const { product, related } = data;

  const handleAdd = async () => {
    await addItem(product._id, variant.sku, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <div className="detail">
        <div>
          <img src={variant?.images?.[0] || product.images?.[0]} alt={product.name} />
        </div>
        <div>
          <h1>{product.name}</h1>
          <p className="muted">{product.scentProfile?.scentName}</p>
          <div className="price" style={{ fontSize: 26, margin: '12px 0' }}>{formatVnd(variant?.price)}</div>
          {variant?.compareAtPrice > variant?.price && (
            <span className="compare">{formatVnd(variant.compareAtPrice)}</span>
          )}

          <p>{product.shortDescription}</p>

          {product.variants?.length > 1 && (
            <div className="field">
              <label>Kích thước</label>
              <select value={variant?.sku} onChange={(e) => setVariant(product.variants.find((v) => v.sku === e.target.value))}>
                {product.variants.map((v) => <option key={v.sku} value={v.sku}>{v.sizeLabel} — {formatVnd(v.price)}</option>)}
              </select>
            </div>
          )}

          <div className="row" style={{ alignItems: 'flex-end', marginTop: 12 }}>
            <div className="field" style={{ width: 90 }}>
              <label>Số lượng</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
            </div>
            <button className="btn" disabled={!variant || variant.stockQuantity < 1} onClick={handleAdd}>
              {variant?.stockQuantity < 1 ? 'Hết hàng' : added ? '✓ Đã thêm' : 'Thêm vào giỏ'}
            </button>
          </div>

          <p className="muted" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{product.description}</p>
        </div>
      </div>

      <section style={{ marginTop: 40 }}>
        <h2 className="section-title">Đánh giá ({reviews.count}) — ⭐ {reviews.average}</h2>
        {user && <ReviewForm productId={product._id} onDone={() => {}} />}
        {reviews.reviews.map((rv) => (
          <div key={rv._id} className="card" style={{ marginBottom: 12 }}>
            <strong>{'⭐'.repeat(rv.rating)}</strong> {rv.isVerifiedPurchase && <span className="tag" style={{ position: 'static' }}>Đã mua</span>}
            <p style={{ margin: '6px 0 0' }}>{rv.comment}</p>
          </div>
        ))}
      </section>

      {related?.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 className="section-title">Sản phẩm liên quan</h2>
          <div className="grid">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}

function ReviewForm({ productId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.post(`/products/${productId}/reviews`, { rating, comment });
    setDone(true);
    setComment('');
  };

  if (done) return <p className="muted">Cảm ơn! Đánh giá của bạn đang chờ duyệt.</p>;
  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
      <div className="field">
        <label>Số sao</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}
        </select>
      </div>
      <div className="field">
        <label>Nhận xét</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required />
      </div>
      <button className="btn">Gửi đánh giá</button>
    </form>
  );
}
