import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import useSeo from '../utils/useSeo.js';
import { useCart } from '../context/CartContext.jsx';
import { formatVnd } from '../utils/format.js';

const C = {
  ink: '#2C2C2C', cream: '#F5EFE6', brown: '#8B6B4A', brownDk: '#765939',
  gold: '#DCC5A1', goldYellow: '#D9A441', muted: '#9b9289', soft: '#FBF8F2', border: '#F0E9DD',
};
const GRADS = [
  'radial-gradient(120% 120% at 30% 25%,#f7e2db,#c79c8a)',
  'radial-gradient(120% 120% at 30% 25%,#dcc09a,#6f5436)',
  'radial-gradient(120% 120% at 30% 25%,#f2e4b0,#c89a4e)',
  'radial-gradient(120% 120% at 30% 25%,#dde4cf,#8a9b6f)',
  'radial-gradient(120% 120% at 30% 25%,#f4e7cb,#c9a86f)',
  'radial-gradient(120% 120% at 30% 25%,#d6e3e1,#7f9fa0)',
];
const serif = { fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif" };
const eyebrowSt = { fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: C.brown, fontWeight: 600, marginBottom: 12 };

// Fallback dùng khi server chưa có banner
const FALLBACK_SLIDES = [
  {
    eyebrow: 'Nến thơm thủ công · Tinh dầu thiên nhiên',
    t1: 'Thắp sáng không gian', t2: 'Chạm đến sự thư thái',
    sub: 'Nến thơm thủ công từ tinh dầu thiên nhiên, mang đến trải nghiệm thư giãn và sang trọng cho ngôi nhà của bạn.',
    bg: 'linear-gradient(120deg,#2a2018 0%,#4a3725 55%,#6b4f33 100%)',
    glow: '72% 50%', a: 'Mua ngay', b: 'Khám phá bộ sưu tập', linkUrl: '/products',
  },
  {
    eyebrow: 'Bộ sưu tập mới · Gỗ & Ấm áp',
    t1: 'Hương gỗ trầm ấm', t2: 'cho mùa đoàn viên',
    sub: 'Đàn hương, tuyết tùng và hổ phách — bộ sưu tập sang trọng dành cho phòng khách và những buổi tối bên nhau.',
    bg: 'linear-gradient(120deg,#241c14 0%,#3d2f20 55%,#5e472f 100%)',
    glow: '68% 45%', a: 'Khám phá ngay', b: 'Xem bộ sưu tập', linkUrl: '/products',
  },
  {
    eyebrow: 'Quà tặng tinh tế',
    t1: 'Món quà của', t2: 'hương thơm & cảm xúc',
    sub: 'Những hộp quà nến thơm được tuyển chọn và đóng gói thủ công — tinh tế, sang trọng, đầy yêu thương.',
    bg: 'linear-gradient(120deg,#2c2118 0%,#4a3322 55%,#74553a 100%)',
    glow: '70% 48%', a: 'Chọn quà tặng', b: 'Tất cả sản phẩm', linkUrl: '/products',
  },
];

// Map banner từ server sang slide format
const BG_FALLBACKS = [
  'linear-gradient(120deg,#2a2018 0%,#4a3725 55%,#6b4f33 100%)',
  'linear-gradient(120deg,#241c14 0%,#3d2f20 55%,#5e472f 100%)',
  'linear-gradient(120deg,#2c2118 0%,#4a3322 55%,#74553a 100%)',
];
const bannerToSlide = (b, i) => ({
  eyebrow: '',
  t1: b.title || '',
  t2: '',
  sub: b.subtitle || '',
  img: b.imageUrl || '',
  bg: BG_FALLBACKS[i % BG_FALLBACKS.length],
  glow: '70% 48%',
  a: 'Mua ngay',
  b: 'Xem thêm',
  linkUrl: b.linkUrl || '/products',
});

const SVG = {
  leaf: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z"/><path d="M4 20c4-8 8-10 13-12"/></svg>,
  candle: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="9" width="8" height="12" rx="1"/><path d="M12 9V6"/><path d="M12 3c1.5 1 1.5 3 0 4-1.5-1-1.5-3 0-4z"/></svg>,
  wind: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h9"/></svg>,
  truck: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="13" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>,
  bag: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.7 3c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2C21.3 3 23.4 4.9 23.4 7.6c0 3.8-3.4 6.9-8.6 11.6L12 20.5z"/></svg>,
  heartFilled: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.7 3c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2C21.3 3 23.4 4.9 23.4 7.6c0 3.8-3.4 6.9-8.6 11.6L12 20.5z"/></svg>,
};

const REASONS = [
  { icon: SVG.leaf,   title: 'Tinh dầu thiên nhiên', text: '100% tinh dầu nguyên chất, không hương liệu tổng hợp.' },
  { icon: SVG.candle, title: 'Sáp đậu nành cao cấp', text: 'Sáp đậu nành nguyên chất, thân thiện môi trường.' },
  { icon: SVG.wind,   title: 'Cháy sạch, ít khói',   text: 'Bấc cotton cháy đều, ít muội than và khói.' },
  { icon: SVG.truck,  title: 'Giao hàng toàn quốc',  text: 'Miễn phí giao hàng cho đơn từ 500.000₫.' },
];

const FALLBACK_REVIEWS = [
  { reviewerName: 'Minh ',   productName: 'Khách hàng thân thiết', rating: 5, comment: 'Mùi hương tinh tế, cháy rất lâu và đều. Cả căn phòng như một spa thu nhỏ.' },
  { reviewerName: 'Hoàng Long', productName: 'Đã mua 8 sản phẩm',     rating: 5, comment: 'Đóng gói sang trọng, làm quà tặng cực kỳ ưng ý. Sẽ tiếp tục ủng hộ shop.' },
  { reviewerName: 'Thu Hà',     productName: 'Khách hàng mới',        rating: 5, comment: 'Hương oải hương giúp tôi ngủ ngon hơn hẳn. Chất lượng vượt mong đợi.' },
];

export default function Home() {
  useSeo({ title: 'Nến thơm thủ công cao cấp', description: 'Nến thơm handmade từ tinh dầu thiên nhiên — thắp sáng không gian, chạm đến sự thư thái.' });
  const [d, setD] = useState({});
  useEffect(() => { api.get('/home').then((r) => setD(r.data)).catch(() => {}); }, []);

  return (
    <div className="home" style={{ background: '#fff' }}>
      <Hero banners={d.banners || []} />
      <PromoStrip />
      <ScentCategories categories={d.categories || []} />
      <Featured products={d.featured?.length ? d.featured : d.newProducts || []} />
      <PromoBanner />
      <NewArrivals products={d.newProducts?.length ? d.newProducts : d.featured || []} />
      <Spaces />
      <WhyUs />
      <Reviews items={d.testimonials?.length ? d.testimonials : FALLBACK_REVIEWS} />
      <BlogSection posts={d.latestPosts || []} />
      <Gallery products={[...(d.featured || []), ...(d.newProducts || [])]} />
    </div>
  );
}

/* ======================================================= */
/* HERO SLIDER                                             */
/* ======================================================= */
function Hero({ banners }) {
  const slides = banners.length ? banners.map(bannerToSlide) : FALLBACK_SLIDES;
  const total = slides.length;
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIdx(0);
  }, [total]);

  useEffect(() => {
    if (total < 2) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % total), 5500);
    return () => clearInterval(timer.current);
  }, [total]);

  const s = slides[idx] || slides[0];

  return (
    <section style={{ position: 'relative', height: '88vh', minHeight: 620, display: 'flex', alignItems: 'center', overflow: 'hidden', background: s.bg, transition: 'background 0.9s ease' }}>
      {/* Ảnh nền từ server (nếu có) */}
      {s.img && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 0.6s ease' }} />
      )}
      {/* Glow overlay */}
      {!s.img && (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 70% at ${s.glow},rgba(255,206,120,.44) 0%,transparent 62%)`, transition: 'all 0.9s ease' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(20,15,10,.62) 0%,rgba(20,15,10,.15) 65%)' }} />

      <div className="container" style={{ position: 'relative', padding: '100px 32px', width: '100%' }}>
        <div style={{ maxWidth: 580, color: C.cream }}>
          {s.eyebrow && (
            <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: C.gold, marginBottom: 22, fontWeight: 600 }}>{s.eyebrow}</div>
          )}
          <h1 style={{ ...serif, fontSize: 'clamp(38px,6vw,66px)', lineHeight: 1.05, fontWeight: 600, margin: '0 0 24px' }}>
            {s.t1}{s.t2 && <><br />{s.t2}</>}
          </h1>
          {s.sub && (
            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(245,239,230,.82)', maxWidth: 480, margin: '0 0 42px' }}>{s.sub}</p>
          )}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => navigate(s.linkUrl)} className="hero-btn hero-btn-light">{s.a}</button>
            <button onClick={() => navigate('/products')} className="hero-btn hero-btn-ghost">{s.b}</button>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {total > 1 && (
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
          {slides.map((_, i) => (
            <span key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 30 : 9, height: 9, borderRadius: 5, background: i === idx ? '#fff' : 'rgba(255,255,255,.38)', cursor: 'pointer', transition: 'all 0.35s' }} />
          ))}
        </div>
      )}

      {/* Arrows */}
      {total > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + total) % total)} className="hero-arrow hero-arrow-l">‹</button>
          <button onClick={() => setIdx((i) => (i + 1) % total)} className="hero-arrow hero-arrow-r">›</button>
        </>
      )}
    </section>
  );
}

/* ======================================================= */
/* SECTION HEADING                                         */
/* ======================================================= */
function SectionHead({ over, title, center = true, mb = 50 }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: mb }}>
      <div style={eyebrowSt}>{over}</div>
      <h2 style={{ ...serif, fontSize: 44, fontWeight: 600, margin: 0, color: C.ink }}>{title}</h2>
    </div>
  );
}

/* ======================================================= */
/* SCENT CATEGORIES                                        */
/* ======================================================= */
function ScentCategories({ categories }) {
  if (!categories.length) return null;
  return (
    <section>
      <div className="container" style={{ padding: '96px 32px 48px' }}>
      <SectionHead over="Khám phá theo mùi hương" title="Danh mục mùi hương" mb={52} />
      <div className="home-cat-grid">
        {categories.slice(0, 6).map((c, i) => (
          <Link key={c._id} to={`/category/${c.slug}`} style={{ textAlign: 'center', display: 'block' }} className="cat-link">
            <div className="cat-circle" style={{ borderRadius: 16, background: c.imageUrl ? `url(${c.imageUrl}) center/cover` : GRADS[i % GRADS.length] }}>
              {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 70% at 50% 30%,rgba(255,255,255,.26),transparent 60%)' }} />
            </div>
            <div style={{ ...serif, fontSize: 21, fontWeight: 600, color: C.ink, marginTop: 14 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Xem bộ sưu tập</div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* PROMO STRIP                                             */
/* ======================================================= */
function PromoStrip() {
  const items = ['🚚 Miễn phí ship đơn từ 500.000₫', '🕯️ Sáp đậu nành 100% thiên nhiên', '🎁 Đóng gói quà tặng miễn phí', '⭐ 12.000+ khách hàng tin yêu', '♻️ Thân thiện với môi trường'];
  return (
    <div style={{ background: C.ink, color: C.cream, padding: '11px 0', overflow: 'hidden', borderBottom: `1px solid rgba(255,255,255,.08)` }}>
      <div style={{ display: 'flex', gap: 60, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 500, letterSpacing: 0.5, opacity: 0.88 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ======================================================= */
/* FEATURED PRODUCTS                                       */
/* ======================================================= */
function Featured({ products }) {
  if (!products.length) return null;
  return (
    <section style={{ background: C.cream }}>
      <div className="container" style={{ padding: '90px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionHead over="Được yêu thích nhất" title="Sản phẩm nổi bật" center={false} mb={0} />
          <Link to="/products" style={{ fontSize: 14, fontWeight: 600, color: C.brown, borderBottom: `1px solid ${C.brown}`, paddingBottom: 3, whiteSpace: 'nowrap' }}>Xem tất cả →</Link>
        </div>
        <div className="home-prod-grid" style={{ marginTop: 40 }}>
          {products.slice(0, 8).map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <Link to="/products" style={{ display: 'inline-block', padding: '14px 44px', background: C.ink, color: C.cream, borderRadius: 50, fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: 'none', transition: 'background .25s' }}>Xem toàn bộ sản phẩm</Link>
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* NEW ARRIVALS                                            */
/* ======================================================= */
function NewArrivals({ products }) {
  if (!products.length) return null;
  return (
    <section style={{ background: '#fff' }}>
      <div className="container" style={{ padding: '90px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionHead over="Mới nhất" title="Hàng mới về" center={false} mb={0} />
          <Link to="/products?sort=newest" style={{ fontSize: 14, fontWeight: 600, color: C.brown, borderBottom: `1px solid ${C.brown}`, paddingBottom: 3, whiteSpace: 'nowrap' }}>Xem tất cả →</Link>
        </div>
        <div className="home-prod-grid" style={{ marginTop: 40 }}>
          {products.slice(0, 8).map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* PROMO BANNER                                            */
/* ======================================================= */
function PromoBanner() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: '0 32px 80px' }}>
      <div className="container">
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(120deg,#2a2018 0%,#5e3e26 55%,#8B6B4A 100%)', padding: '64px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ color: C.cream, maxWidth: 520 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.gold, fontWeight: 600, marginBottom: 16 }}>Ưu đãi đặc biệt</div>
            <h2 style={{ ...serif, fontSize: 'clamp(26px,4vw,44px)', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.15 }}>Mua 2 tặng 1 — Bộ sưu tập quà tặng</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(245,239,230,.78)', margin: '0 0 32px', maxWidth: 420 }}>Chọn bất kỳ 2 sản phẩm và nhận thêm 1 nến mini miễn phí. Đóng gói thủ công, sẵn sàng làm quà.</p>
            <button onClick={() => navigate('/products')} style={{ padding: '14px 36px', background: C.gold, color: C.ink, border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.4 }}>Chọn ngay</button>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[['2', 'Năm thành lập'], ['12K+', 'Khách hàng'], ['100%', 'Thiên nhiên'], ['500+', 'Đơn hàng/tháng']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center', minWidth: 88 }}>
                <div style={{ ...serif, fontSize: 36, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,239,230,.65)', marginTop: 6, letterSpacing: 0.5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* PRODUCT CARD                                            */
/* ======================================================= */
function ProductCard({ p }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const variant = p.variants?.[0];
  const price = variant?.price ?? 0;
  const compare = variant?.compareAtPrice;
  const img = p.images?.[0] || variant?.images?.[0];
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const hash = p._id ? [...p._id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0) : 0;
  const gradIdx = Math.abs(hash) % GRADS.length;
  const badge = discount > 0 ? `-${discount}%` : p.isNew ? 'New' : p.isFeatured ? 'Best Seller' : null;

  const add = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (variant) { await addItem(p._id, variant.sku, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); }
  };

  return (
    <Link to={`/products/${p.slug}`} className="home-card pcard-link">
      {/* Image area */}
      <div style={{ position: 'relative', padding: 13 }}>
        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 13, overflow: 'hidden', background: img ? undefined : GRADS[gradIdx], position: 'relative' }} className="pcard-img">
          {img && <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          {!img && <div style={{ position: 'absolute', inset: 0, background: GRADS[gradIdx] }} />}
        </div>
        {badge && (
          <span style={{ position: 'absolute', top: 23, left: 23, background: C.ink, color: C.cream, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 7 }}>{badge}</span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished((w) => !w); }}
          style={{ position: 'absolute', top: 23, right: 23, width: 34, height: 34, borderRadius: '50%', background: wished ? C.brown : 'rgba(255,255,255,.88)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wished ? '#fff' : C.ink, transition: 'all 0.22s' }}
        >
          {wished ? SVG.heartFilled : SVG.heart}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '2px 18px 20px' }}>
        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
          <span style={{ color: C.goldYellow, fontSize: 12, letterSpacing: 1 }}>★★★★★</span>
          {p.reviewCount > 0 && <span style={{ fontSize: 11, color: C.muted }}>({p.reviewCount})</span>}
        </div>
        <div style={{ ...serif, fontSize: 21, fontWeight: 600, lineHeight: 1.2, color: C.ink }}>{p.name}</div>
        {p.shortDescription && (
          <div style={{ fontSize: 12, color: C.muted, margin: '3px 0 13px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.shortDescription}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: p.shortDescription ? 0 : 13 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.brown }}>{formatVnd(price)}</span>
            {discount > 0 && <span style={{ fontSize: 12, color: '#b7ada0', textDecoration: 'line-through', marginLeft: 7 }}>{formatVnd(compare)}</span>}
          </div>
          <button
            onClick={add}
            title="Thêm vào giỏ"
            style={{ width: 38, height: 38, borderRadius: 10, background: added ? C.brown : C.cream, color: added ? '#fff' : C.ink, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', flexShrink: 0 }}
          >
            {added ? <span style={{ fontSize: 14 }}>✓</span> : SVG.bag}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ======================================================= */
/* SPACES                                                  */
/* ======================================================= */
function Spaces() {
  const navigate = useNavigate();
  const items = [
    ['Phòng ngủ',      '[ bedroom ]',     'linear-gradient(150deg,#caa090,#7d5a44)'],
    ['Phòng khách',    '[ living room ]',  'linear-gradient(150deg,#dcc09a,#8B6B4A)'],
    ['Phòng làm việc', '[ workspace ]',    'linear-gradient(150deg,#c4953f,#6f5436)'],
    ['Thiền & Yoga',   '[ meditation ]',   'linear-gradient(150deg,#8fa074,#566042)'],
  ];
  return (
    <section>
      <div className="container" style={{ padding: '96px 32px' }}>
      <SectionHead over="Cho từng khoảnh khắc" title="Bộ sưu tập theo không gian" mb={50} />
      <div className="home-space-grid">
        {items.map(([name, tag, bg]) => (
          <div key={name} onClick={() => navigate('/products')} style={{ position: 'relative', height: 340, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', background: bg }} className="space-card">
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(30,22,15,0) 35%,rgba(30,22,15,.72) 100%)' }} />
            <div style={{ position: 'absolute', left: 11, top: 11, fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,250,240,.55)', letterSpacing: 1 }}>{tag}</div>
            <div style={{ position: 'absolute', left: 22, bottom: 22, color: C.cream }}>
              <div style={{ ...serif, fontSize: 25, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, letterSpacing: 1, opacity: .82, marginTop: 6 }}>Khám phá →</div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* WHY US                                                  */
/* ======================================================= */
function WhyUs() {
  return (
    <section style={{ background: C.ink, color: C.cream }}>
      <div className="container" style={{ padding: '80px 32px' }}>
        <div className="home-why-grid">
          {REASONS.map(({ icon, title, text }) => (
            <div key={title} style={{ textAlign: 'center', padding: '0 8px' }}>
              <div style={{ width: 58, height: 58, margin: '0 auto 18px', borderRadius: '50%', border: '1px solid rgba(220,197,161,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
                {icon}
              </div>
              <div style={{ ...serif, fontSize: 21, fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(245,239,230,.7)', maxWidth: 220, margin: '0 auto' }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* REVIEWS — carousel                                      */
/* ======================================================= */
function Reviews({ items }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  const rv = items[idx];
  return (
    <section>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
        <SectionHead over="Khách hàng nói gì" title="Được tin yêu bởi 12.000+ khách hàng" mb={44} />
        <div style={{ position: 'relative', minHeight: 200 }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ color: C.goldYellow, fontSize: 18, letterSpacing: 3, marginBottom: 20 }}>{'★'.repeat(rv.rating || 5)}</div>
            <p style={{ ...serif, fontSize: 27, lineHeight: 1.5, fontWeight: 500, fontStyle: 'italic', margin: '0 0 26px', color: C.ink }}>"{rv.comment}"</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: GRADS[idx % GRADS.length] }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rv.reviewerName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{rv.productName}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 36 }}>
          {items.map((_, i) => (
            <span key={i} onClick={() => setIdx(i)} style={{ width: 9, height: 9, borderRadius: '50%', cursor: 'pointer', background: i === idx ? C.brown : '#dcd2c2', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* BLOG SECTION                                            */
/* ======================================================= */
const FALLBACK_POSTS = [
  { _id: 'f1', slug: '#', title: '5 mùi hương giúp bạn ngủ ngon hơn mỗi đêm', category: 'Thư giãn', publishedAt: '2026-06-12', excerpt: 'Khám phá những hương thơm dịu nhẹ giúp thư giãn thần kinh và cải thiện giấc ngủ tự nhiên.', grad: GRADS[3] },
  { _id: 'f2', slug: '#', title: 'Cách đốt nến thơm đúng để cháy đều và bền lâu', category: 'Hướng dẫn', publishedAt: '2026-06-05', excerpt: 'Mẹo nhỏ từ chuyên gia để cây nến của bạn cháy đẹp, tỏa hương trọn vẹn và an toàn.', grad: GRADS[4] },
  { _id: 'f3', slug: '#', title: 'Chọn mùi hương theo từng không gian sống', category: 'Phong cách', publishedAt: '2026-05-28', excerpt: 'Phòng ngủ, phòng khách hay góc làm việc — mỗi không gian xứng đáng một hương thơm riêng.', grad: GRADS[1] },
];

function BlogSection({ posts }) {
  const items = posts.length ? posts : FALLBACK_POSTS;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <section style={{ background: C.cream }}>
      <div className="container" style={{ padding: '90px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionHead over="Kiến thức & cảm hứng" title="Từ blog của chúng tôi" center={false} />
          <Link to="/blog" style={{ fontSize: 14, fontWeight: 600, color: C.brown, borderBottom: `1px solid ${C.brown}`, paddingBottom: 3, whiteSpace: 'nowrap', marginBottom: 48 }}>Xem tất cả bài viết →</Link>
        </div>
        <div className="home-blog-grid">
          {items.slice(0, 3).map((post, i) => (
            <Link key={post._id} to={post.slug !== '#' ? `/blog/${post.slug}` : '/blog'} className="blog-home-card">
              {/* Thumbnail */}
              <div className="blog-home-img" style={{ background: post.thumbnailUrl ? undefined : (post.grad || GRADS[i % GRADS.length]) }}>
                {post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                {post.category && (
                  <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(44,33,24,.72)', backdropFilter: 'blur(6px)', color: '#F5EFE6', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '5px 11px', borderRadius: 7 }}>{post.category}</span>
                )}
              </div>
              {/* Body */}
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{fmtDate(post.publishedAt)}</div>
                <div style={{ ...serif, fontSize: 19, fontWeight: 600, lineHeight: 1.35, color: C.ink, marginBottom: 10 }}>{post.title}</div>
                {post.excerpt && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.brown, marginTop: 16 }}>Đọc thêm →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================= */
/* INSTAGRAM GALLERY                                       */
/* ======================================================= */
function Gallery({ products }) {
  const imgs = products.map((p) => p.images?.[0] || p.variants?.[0]?.images?.[0]).filter(Boolean).slice(0, 6);
  while (imgs.length < 6) imgs.push(null);
  return (
    <section style={{ paddingBottom: 96 }}>
      <div style={{ textAlign: 'center', marginBottom: 36, padding: '0 32px' }}>
        <div style={eyebrowSt}>@nenthom.abc</div>
        <h2 style={{ ...serif, fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, margin: 0, color: C.ink }}>Theo dõi trên Instagram</h2>
      </div>
      <div className="home-gallery" style={{ maxWidth: 1440, margin: '0 auto' }}>
        {imgs.map((src, i) => (
          <div key={i} className="gallery-cell" style={{ aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer', background: src ? undefined : GRADS[i % GRADS.length] }}>
            {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} className="gallery-img" />}
          </div>
        ))}
      </div>
    </section>
  );
}
