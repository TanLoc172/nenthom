import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client.js';
import useSeo from '../utils/useSeo.js';
import { useCart } from '../context/CartContext.jsx';
import { formatVnd } from '../utils/format.js';
import { FadeUp, StaggerList, StaggerItem, MotionBtn } from '../components/Motion.jsx';

/* ── Tokens ── */
const T = {
  ink: '#2C2C2C', cream: '#F5EFE6', brown: '#8B6B4A', brownDk: '#765939',
  gold: '#DCC5A1', goldY: '#D9A441', muted: '#9b9289', soft: '#FBF8F2', border: '#F0E9DD',
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
};

const GRADS = [
  'linear-gradient(135deg,#e8d5c4,#c4957a)',
  'linear-gradient(135deg,#d4c49a,#8B6B4A)',
  'linear-gradient(135deg,#e8d9b0,#c49a52)',
  'linear-gradient(135deg,#c8d8c4,#7a9b70)',
  'linear-gradient(135deg,#e4d4b8,#c4a06a)',
  'linear-gradient(135deg,#c4d4d2,#7a9fa0)',
];

const HERO_SLIDES = [
  {
    eyebrow: 'Nến thơm thủ công · Tinh dầu thiên nhiên',
    h1: 'Thắp sáng không gian', h2: 'Chạm đến sự thư thái',
    sub: 'Nến thơm handmade từ tinh dầu nguyên chất — mang đến trải nghiệm thư giãn và sang trọng cho ngôi nhà của bạn.',
    bg: 'linear-gradient(120deg,#1e150d 0%,#3d2b1a 50%,#5e3f26 100%)',
    btnA: 'Mua ngay', btnB: 'Khám phá bộ sưu tập', href: '/products',
  },
  {
    eyebrow: 'Bộ sưu tập Gỗ & Ấm áp',
    h1: 'Hương gỗ trầm ấm', h2: 'cho mùa đoàn viên',
    sub: 'Đàn hương, tuyết tùng và hổ phách — sang trọng dành cho phòng khách và những buổi tối bên gia đình.',
    bg: 'linear-gradient(120deg,#1a1410 0%,#2e2216 50%,#4a3420 100%)',
    btnA: 'Khám phá ngay', btnB: 'Xem bộ sưu tập', href: '/products',
  },
  {
    eyebrow: 'Quà tặng tinh tế',
    h1: 'Món quà của', h2: 'hương thơm & cảm xúc',
    sub: 'Những hộp quà nến thơm được tuyển chọn và đóng gói thủ công — tinh tế, sang trọng, đầy yêu thương.',
    bg: 'linear-gradient(120deg,#201710 0%,#3a2818 50%,#5a3e28 100%)',
    btnA: 'Chọn quà tặng', btnB: 'Tất cả sản phẩm', href: '/products',
  },
];

const FALLBACK_REVIEWS = [
  { _id: 'r1', reviewerName: 'Minh Anh', label: 'Khách hàng thân thiết', rating: 5, comment: 'Mùi hương tinh tế, cháy rất lâu và đều. Cả căn phòng như một spa thu nhỏ. Sẽ mua lại.' },
  { _id: 'r2', reviewerName: 'Hoàng Long', label: 'Đã mua 8 sản phẩm', rating: 5, comment: 'Đóng gói sang trọng, làm quà tặng cực kỳ ưng ý. Mùi thơm kéo dài cả ngày.' },
  { _id: 'r3', reviewerName: 'Thu Hà', label: 'Khách hàng mới', rating: 5, comment: 'Hương oải hương giúp tôi ngủ ngon hơn hẳn. Chất lượng vượt xa mong đợi, rất đáng tiền.' },
];

const FALLBACK_POSTS = [
  { _id: 'p1', slug: '#', title: '5 mùi hương giúp bạn ngủ ngon hơn mỗi đêm', category: 'Thư giãn', publishedAt: '2026-06-12', excerpt: 'Khám phá những hương thơm dịu nhẹ giúp thư giãn thần kinh và cải thiện giấc ngủ.', grad: GRADS[3] },
  { _id: 'p2', slug: '#', title: 'Cách đốt nến thơm đúng để cháy đều và bền lâu', category: 'Hướng dẫn', publishedAt: '2026-06-05', excerpt: 'Mẹo nhỏ để cây nến của bạn cháy đẹp, tỏa hương trọn vẹn và an toàn nhất.', grad: GRADS[4] },
  { _id: 'p3', slug: '#', title: 'Chọn mùi hương theo từng không gian sống', category: 'Phong cách', publishedAt: '2026-05-28', excerpt: 'Phòng ngủ, phòng khách hay góc làm việc — mỗi không gian xứng đáng một hương thơm riêng.', grad: GRADS[1] },
];

const BG_FALLBACKS = [
  'linear-gradient(120deg,#1e150d 0%,#3d2b1a 50%,#5e3f26 100%)',
  'linear-gradient(120deg,#1a1410 0%,#2e2216 50%,#4a3420 100%)',
  'linear-gradient(120deg,#201710 0%,#3a2818 50%,#5a3e28 100%)',
];

/* ── Icons ── */
const Icon = {
  leaf:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z"/><path d="M4 20c4-8 8-10 13-12"/></svg>,
  candle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="9" width="8" height="12" rx="1"/><path d="M12 9V6"/><path d="M12 3c1.5 1 1.5 3 0 4-1.5-1-1.5-3 0-4z"/></svg>,
  wind:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h9"/></svg>,
  truck:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="13" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>,
  bag:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>,
  heart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.7 3c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.6 0 4.7 1.9 4.7 4.6 0 3.8-3.4 6.9-8.6 11.6L12 20.5z"/></svg>,
  heartF: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.9 4.1 3 6.7 3c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.6 0 4.7 1.9 4.7 4.6 0 3.8-3.4 6.9-8.6 11.6L12 20.5z"/></svg>,
  star:   <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  quote:  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" opacity=".15"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
};

/* ── Helpers ── */
const gradIdx = (id = '') => Math.abs([...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)) % GRADS.length;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/* ══════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════ */
export default function Home() {
  useSeo({ title: 'Nến thơm thủ công cao cấp', description: 'Nến thơm handmade từ tinh dầu thiên nhiên — thắp sáng không gian, chạm đến sự thư thái.' });
  const [d, setD] = useState({});
  useEffect(() => { api.get('/home').then(r => setD(r.data)).catch(() => {}); }, []);

  const featured = d.featured?.length ? d.featured : (d.newProducts || []);
  const newArrivals = d.newProducts?.length ? d.newProducts : (d.featured || []);
  const allProducts = [...new Map([...featured, ...newArrivals].map(p => [p._id, p])).values()];

  return (
    <div style={{ background: '#fff' }}>
      <Hero banners={d.banners || []} />
      <TrustBar />
      {(d.categories || []).length > 0 && <Categories categories={d.categories} />}
      {d.flashSale && <FlashSale sale={d.flashSale} />}
      <BrandBanner />
      <ProductTabs featured={featured} newArrivals={newArrivals} />
      <Spaces />
      <WhyUs />
      <Blog posts={d.latestPosts?.length ? d.latestPosts : FALLBACK_POSTS} />
      <Reviews items={d.testimonials?.length ? d.testimonials : FALLBACK_REVIEWS} />
      <Gallery images={allProducts.slice(0, 8).flatMap(p => p.images?.[0] ? [p.images[0]] : (p.variants?.[0]?.images?.[0] ? [p.variants[0].images[0]] : [null])).slice(0, 8)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
function Hero({ banners }) {
  const slides = banners.length
    ? banners.map((b, i) => ({ eyebrow: '', h1: b.title || '', h2: '', sub: b.subtitle || '', bg: BG_FALLBACKS[i % 3], img: b.imageUrl || '', btnA: 'Mua ngay', btnB: 'Xem thêm', href: b.linkUrl || '/products' }))
    : HERO_SLIDES;
  const total = slides.length;
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { setIdx(0); }, [total]);
  useEffect(() => {
    if (total < 2) return;
    timer.current = setInterval(() => setIdx(i => (i + 1) % total), 5500);
    return () => clearInterval(timer.current);
  }, [total]);

  const s = slides[idx] || slides[0];

  return (
    <section style={{ position: 'relative', height: '90vh', minHeight: 620, display: 'flex', alignItems: 'center', overflow: 'hidden', background: s.bg, transition: 'background 1s ease' }}>
      {s.img && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(15,10,6,.75) 0%,rgba(15,10,6,.35) 55%,transparent 100%)' }} />
      {!s.img && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(55% 65% at 72% 48%,rgba(200,150,80,.28) 0%,transparent 65%)' }} />}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 600, color: T.cream }}>
          {s.eyebrow && <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: T.gold, fontWeight: 700, marginBottom: 20 }}>{s.eyebrow}</div>}
          <h1 style={{ ...T.serif, fontSize: 'clamp(40px,6.5vw,72px)', fontWeight: 600, lineHeight: 1.05, margin: '0 0 22px' }}>
            {s.h1}{s.h2 && <><br /><span style={{ color: T.gold }}>{s.h2}</span></>}
          </h1>
          {s.sub && <p style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(245,239,230,.8)', maxWidth: 460, margin: '0 0 40px' }}>{s.sub}</p>}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => navigate(s.href)} className="hero-btn hero-btn-light">{s.btnA}</button>
            <button onClick={() => navigate('/products')} className="hero-btn hero-btn-ghost">{s.btnB}</button>
          </div>
        </div>
      </div>

      {total > 1 && (
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 9 }}>
          {slides.map((_, i) => (
            <span key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,.35)', cursor: 'pointer', transition: 'all .35s' }} />
          ))}
        </div>
      )}
      {total > 1 && <>
        <button onClick={() => setIdx(i => (i - 1 + total) % total)} className="hero-arrow hero-arrow-l">‹</button>
        <button onClick={() => setIdx(i => (i + 1) % total)} className="hero-arrow hero-arrow-r">›</button>
      </>}
    </section>
  );
}

/* ══════════════════════════════════════════════════
   TRUST BAR
══════════════════════════════════════════════════ */
function TrustBar() {
  const items = [
    { icon: Icon.truck,  text: 'Miễn phí ship từ 500k' },
    { icon: Icon.leaf,   text: 'Tinh dầu 100% thiên nhiên' },
    { icon: Icon.candle, text: 'Sáp đậu nành cao cấp' },
    { icon: Icon.wind,   text: 'Cháy sạch, ít khói' },
  ];
  return (
    <div style={{ background: T.ink, color: T.cream }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1 }}>
        {items.map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px 16px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ color: T.gold, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════ */
function Categories({ categories }) {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <FadeUp><SectionHead eyebrow="Khám phá" title="Danh mục mùi hương" /></FadeUp>
        <StaggerList className="home-cat-grid" style={{ marginTop: 44 }}>
          {categories.slice(0, 6).map((c, i) => (
            <StaggerItem key={c._id}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                <Link to={`/category/${c.slug}`} className="cat-link" style={{ textAlign: 'center', display: 'block' }}>
                  <div className="cat-circle" style={{ background: c.imageUrl ? undefined : GRADS[i % GRADS.length] }}>
                    {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(30,20,10,.35) 100%)' }} />
                  </div>
                  <div style={{ ...T.serif, fontSize: 20, fontWeight: 600, color: T.ink, marginTop: 12 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2, letterSpacing: .5 }}>Xem bộ sưu tập →</div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════════
   FLASH SALE
══════════════════════════════════════════════════ */
function useCountdown(endTime) {
  const calc = () => {
    const diff = Math.max(0, new Date(endTime) - Date.now());
    return {
      h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
      m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      done: diff === 0,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return t;
}

function FlashSale({ sale }) {
  const { h, m, s, done } = useCountdown(sale.endTime);
  const { addItem } = useCart();
  const [added, setAdded] = useState({});
  if (done || !sale.items?.length) return null;

  const handleAdd = async (e, it) => {
    e.preventDefault();
    try {
      const r = await api.get(`/products/${it.slug}`);
      const v = r.data?.variants?.[0];
      if (!v) return;
      await addItem(it.productId, v.sku, 1);
      setAdded(a => ({ ...a, [it.productId]: true }));
      setTimeout(() => setAdded(a => ({ ...a, [it.productId]: false })), 1400);
    } catch { }
  };

  const TimeBox = ({ val, label }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: T.ink, color: T.cream, borderRadius: 8, padding: '6px 13px', fontSize: 26, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, minWidth: 50 }}>{val}</div>
      <div style={{ fontSize: 10, marginTop: 5, letterSpacing: 1, color: T.muted, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );

  return (
    <section style={{ background: T.cream, padding: '80px 0', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
      {/* subtle warm texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(220,197,161,.35) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>
        <FadeUp>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 52 }}>
            {/* Title */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#b84c35', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
                ⚡ Flash Sale
              </div>
              <h2 style={{ ...T.serif, fontSize: 'clamp(26px,3vw,42px)', fontWeight: 600, color: T.ink, margin: 0, lineHeight: 1.15 }}>{sale.name}</h2>
              {sale.description && <p style={{ fontSize: 14, color: T.muted, marginTop: 8, maxWidth: 400 }}>{sale.description}</p>}
            </div>
            {/* Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: T.muted, marginRight: 4 }}>Kết thúc sau</span>
              <TimeBox val={h} label="giờ" />
              <span style={{ fontSize: 22, fontWeight: 700, color: T.gold, marginBottom: 18 }}>:</span>
              <TimeBox val={m} label="phút" />
              <span style={{ fontSize: 22, fontWeight: 700, color: T.gold, marginBottom: 18 }}>:</span>
              <TimeBox val={s} label="giây" />
            </div>
          </div>
        </FadeUp>

        <StaggerList style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(196px,1fr))', gap: 18 }}>
          {sale.items.slice(0, 5).map((it) => {
            const pct = it.originalPrice > 0 ? Math.round((1 - it.salePrice / it.originalPrice) * 100) : 0;
            const sold = it.soldCount || 0;
            const total = it.saleQuantity || 1;
            const soldPct = Math.min(100, Math.round(sold / total * 100));
            return (
              <StaggerItem key={it.productId}>
                <Link to={`/products/${it.slug}`} style={{ display: 'block', background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 2px 10px rgba(139,107,74,.07)', transition: 'transform .3s,box-shadow .3s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(139,107,74,.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(139,107,74,.07)'; }}
                >
                  {/* Ảnh */}
                  <div style={{ position: 'relative', aspectRatio: '1/1', background: T.soft, overflow: 'hidden' }}>
                    {it.imageUrl
                      ? <img src={it.imageUrl} alt={it.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🕯️</div>}
                    {pct > 0 && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: '#b84c35', color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 6 }}>-{pct}%</span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '14px 14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8, lineHeight: 1.35 }}>{it.productName}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: '#b84c35' }}>{formatVnd(it.salePrice)}</span>
                      {it.originalPrice > it.salePrice && (
                        <span style={{ fontSize: 12, color: T.muted, textDecoration: 'line-through' }}>{formatVnd(it.originalPrice)}</span>
                      )}
                    </div>
                    {/* Progress */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ height: 4, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${soldPct}%`, background: `linear-gradient(90deg,${T.goldY},#b84c35)`, borderRadius: 99, transition: 'width 1s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>Đã bán {sold}/{total}</div>
                    </div>
                    <button onClick={(e) => handleAdd(e, it)}
                      style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: `1.5px solid ${added[it.productId] ? T.brown : T.ink}`, background: added[it.productId] ? T.brown : T.ink, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', letterSpacing: .5 }}>
                      {added[it.productId] ? '✓ Đã thêm' : 'Thêm vào giỏ'}
                    </button>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   BRAND BANNER
══════════════════════════════════════════════════ */
function BrandBanner() {
  const navigate = useNavigate();
  const stats = [['2+', 'Năm thành lập'], ['12K+', 'Khách hàng'], ['100%', 'Thiên nhiên'], ['500+', 'Đơn/tháng']];
  return (
    <section style={{ background: T.ink, padding: '80px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left */}
          <div style={{ color: T.cream }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: T.gold, fontWeight: 700, marginBottom: 18 }}>Câu chuyện thương hiệu</div>
            <h2 style={{ ...T.serif, fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 600, lineHeight: 1.15, margin: '0 0 20px' }}>Mỗi ngọn nến là một <span style={{ color: T.gold }}>câu chuyện thư giãn</span></h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(245,239,230,.72)', margin: '0 0 32px', maxWidth: 420 }}>
              Chúng tôi tin rằng hương thơm có thể chuyển hóa không gian và tâm trạng. Mỗi sản phẩm được làm thủ công từ nguyên liệu thiên nhiên tốt nhất.
            </p>
            <button onClick={() => navigate('/products')} style={{ padding: '13px 36px', background: T.gold, color: T.ink, border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: .4 }}>
              Mua ngay
            </button>
          </div>
          {/* Right — stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {stats.map(([num, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ ...T.serif, fontSize: 44, fontWeight: 700, color: T.gold, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 13, color: 'rgba(245,239,230,.6)', marginTop: 8, letterSpacing: .4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   PRODUCTS SECTION (dùng lại cho 2 section)
══════════════════════════════════════════════════ */
const TABS = [
  { key: 'featured',    label: 'Nổi bật',    eyebrow: 'Được yêu thích nhất' },
  { key: 'newArrivals', label: 'Hàng mới về', eyebrow: 'Mới nhất'           },
];

function ProductTabs({ featured, newArrivals }) {
  const [active, setActive] = useState('featured');
  const lists = { featured, newArrivals };
  const products = lists[active] || [];

  return (
    <section style={{ background: T.soft, padding: '80px 0' }}>
      <div className="container">
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 44 }}>
          {/* Tabs */}
          <div>
            <h2 style={{ ...T.serif, fontSize: 'clamp(38px,5vw,64px)', fontWeight: 600, color: T.ink, margin: '0 0 4px', lineHeight: 1.05 }}>Khám phá</h2>
            <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: T.brown, marginBottom: 14, fontWeight: 600 }}>Sản phẩm</p>
            <div style={{ display: 'flex', gap: 4, background: T.border, borderRadius: 12, padding: 4 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActive(t.key)}
                  style={{
                    padding: '8px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    background: active === t.key ? '#fff' : 'transparent',
                    color: active === t.key ? T.ink : T.muted,
                    boxShadow: active === t.key ? '0 2px 8px rgba(43,44,44,.1)' : 'none',
                    transition: 'all .2s',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Link to="/products" style={{ fontSize: 13, fontWeight: 700, color: T.brown, borderBottom: `1.5px solid ${T.brown}`, paddingBottom: 2, whiteSpace: 'nowrap', letterSpacing: .3 }}>Xem tất cả →</Link>
        </div>

        {/* Grid */}
        <StaggerList key={active} className="home-prod-grid">
          {products.slice(0, 8).map(p => <StaggerItem key={p._id}><PCard p={p} /></StaggerItem>)}
        </StaggerList>

        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: T.muted, padding: '48px 0' }}>Chưa có sản phẩm.</p>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/products" style={{ display: 'inline-block', padding: '14px 48px', background: T.ink, color: T.cream, borderRadius: 50, fontSize: 14, fontWeight: 600, letterSpacing: .4, textDecoration: 'none' }}>
            Xem thêm sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════ */
function PCard({ p }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const v = p.variants?.[0];
  const price = v?.price ?? 0;
  const compare = v?.compareAtPrice;
  const img = p.images?.[0] || v?.images?.[0];
  const discount = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const gi = gradIdx(p._id);
  const badge = discount > 0 ? `-${discount}%` : p.isNew ? 'Mới' : p.isFeatured ? 'Hot' : null;

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!v) return;
    await addItem(p._id, v.sku, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleWish = (e) => { e.preventDefault(); e.stopPropagation(); setWished(w => !w); };

  return (
    <motion.div whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(43,44,44,.13)' }} transition={{ type: 'spring', stiffness: 280, damping: 20 }} style={{ borderRadius: 18 }}>
    <Link to={`/products/${p.slug}`} className="pcard-link home-card">
      {/* Ảnh */}
      <div style={{ position: 'relative', padding: 10 }}>
        <div className="pcard-img" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', background: GRADS[gi], position: 'relative' }}>
          {img && <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        {badge && (
          <span style={{ position: 'absolute', top: 20, left: 20, background: badge.startsWith('-') ? '#c0563f' : T.ink, color: T.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 9px', borderRadius: 6 }}>{badge}</span>
        )}
        <button onClick={handleWish} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', background: wished ? T.brown : 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wished ? '#fff' : T.ink, transition: 'all .22s' }}>
          {wished ? Icon.heartF : Icon.heart}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '4px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <span style={{ color: T.goldY, display: 'flex', gap: 1 }}>{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</span>
          {p.reviewCount > 0 && <span style={{ fontSize: 11, color: T.muted }}>({p.reviewCount})</span>}
        </div>
        <div style={{ ...T.serif, fontSize: 19, fontWeight: 600, lineHeight: 1.25, color: T.ink, marginBottom: 4 }}>{p.name}</div>
        {p.shortDescription && (
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 10, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.shortDescription}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.brown }}>{formatVnd(price)}</span>
            {discount > 0 && <span style={{ fontSize: 12, color: '#bbb', textDecoration: 'line-through', marginLeft: 7 }}>{formatVnd(compare)}</span>}
          </div>
          <button onClick={handleAdd} title="Thêm vào giỏ" style={{ width: 36, height: 36, borderRadius: 10, background: added ? T.brown : T.soft, color: added ? '#fff' : T.ink, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .22s', flexShrink: 0 }}>
            {added ? <span style={{ fontSize: 13, fontWeight: 700 }}>✓</span> : Icon.bag}
          </button>
        </div>
      </div>
    </Link>
    </motion.div>
  );
}


/* ══════════════════════════════════════════════════
   SPACES
══════════════════════════════════════════════════ */
function Spaces() {
  const navigate = useNavigate();
  const items = [
    { name: 'Phòng ngủ',      sub: 'Bedroom', bg: 'linear-gradient(150deg,#c49080,#7d5a44)' },
    { name: 'Phòng khách',    sub: 'Living Room', bg: 'linear-gradient(150deg,#d4b880,#8B6B4A)' },
    { name: 'Phòng làm việc', sub: 'Workspace', bg: 'linear-gradient(150deg,#c48030,#6f5436)' },
    { name: 'Thiền & Yoga',   sub: 'Meditation', bg: 'linear-gradient(150deg,#8f9a64,#566042)' },
  ];
  return (
    <section style={{ padding: '80px 0', background: T.soft }}>
      <div className="container">
        <SectionHead eyebrow="Cho từng khoảnh khắc" title="Bộ sưu tập theo không gian" />
        <div className="home-space-grid" style={{ marginTop: 44 }}>
          {items.map(({ name, sub, bg }) => (
            <div key={name} onClick={() => navigate('/products')} className="space-card" style={{ position: 'relative', height: 320, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', background: bg }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 30%,rgba(20,14,8,.7) 100%)' }} />
              <div style={{ position: 'absolute', left: 24, bottom: 24, color: T.cream }}>
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(245,239,230,.6)', marginBottom: 8 }}>{sub}</div>
                <div style={{ ...T.serif, fontSize: 24, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 12, marginTop: 8, opacity: .8 }}>Khám phá →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   WHY US
══════════════════════════════════════════════════ */
function WhyUs() {
  const items = [
    { icon: Icon.leaf,   title: 'Tinh dầu thiên nhiên', text: '100% tinh dầu nguyên chất, không hương liệu tổng hợp hay phụ gia độc hại.' },
    { icon: Icon.candle, title: 'Sáp đậu nành cao cấp', text: 'Sáp đậu nành nguyên chất, đốt sạch và thân thiện với môi trường.' },
    { icon: Icon.wind,   title: 'Cháy sạch, ít khói',   text: 'Bấc cotton tự nhiên, cháy đều và ổn định, không muội than.' },
    { icon: Icon.truck,  title: 'Giao hàng toàn quốc',  text: 'Miễn phí vận chuyển cho đơn hàng từ 500.000₫ trên toàn quốc.' },
  ];
  return (
    <section style={{ padding: '80px 0', background: '#fff' }}>
      <div className="container">
        <SectionHead eyebrow="Tại sao chọn chúng tôi" title="Cam kết chất lượng" />
        <div className="home-why-grid" style={{ marginTop: 52 }}>
          {items.map(({ icon, title, text }) => (
            <div key={title} style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: T.soft, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.brown }}>
                {icon}
              </div>
              <div style={{ ...T.serif, fontSize: 20, fontWeight: 600, color: T.ink, marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: T.muted, maxWidth: 220, margin: '0 auto' }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════════ */
function Reviews({ items }) {
  if (!items.length) return null;
  return (
    <section style={{ background: T.soft, padding: '80px 0' }}>
      <div className="container">
        <SectionHead eyebrow="Khách hàng nói gì" title="Được tin yêu bởi 12.000+ khách hàng" />
        <div className="home-rev-grid" style={{ marginTop: 44 }}>
          {items.slice(0, 3).map((rv, i) => (
            <div key={rv._id || i} style={{ background: '#fff', borderRadius: 18, padding: '32px 28px', border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(42,35,32,.06)' }}>
              <div style={{ color: T.goldY, display: 'flex', gap: 2, marginBottom: 16 }}>
                {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
              </div>
              <div style={{ color: T.muted, marginBottom: 20, lineHeight: 1 }}>{Icon.quote}</div>
              <p style={{ ...T.serif, fontSize: 18, lineHeight: 1.6, fontStyle: 'italic', color: T.ink, margin: '0 0 24px' }}>"{rv.comment}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: GRADS[i % GRADS.length], flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{rv.reviewerName}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{rv.productName || rv.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   BLOG
══════════════════════════════════════════════════ */
function Blog({ posts }) {
  return (
    <section style={{ background: '#fff', padding: '80px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
          <SectionHead eyebrow="Kiến thức & cảm hứng" title="Từ blog của chúng tôi" align="left" mb={0} />
          <Link to="/blog" style={{ fontSize: 13, fontWeight: 700, color: T.brown, borderBottom: `1.5px solid ${T.brown}`, paddingBottom: 2, whiteSpace: 'nowrap', letterSpacing: .3 }}>Xem tất cả bài viết →</Link>
        </div>
        <div className="home-blog-grid">
          {posts.slice(0, 3).map((post, i) => (
            <Link key={post._id} to={post.slug && post.slug !== '#' ? `/blog/${post.slug}` : '/blog'} className="blog-home-card">
              <div className="blog-home-img" style={{ background: post.thumbnailUrl ? undefined : (post.grad || GRADS[i % GRADS.length]) }}>
                {post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                {post.category && (
                  <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(44,33,24,.75)', backdropFilter: 'blur(6px)', color: T.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6 }}>{post.category}</span>
                )}
              </div>
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{fmtDate(post.publishedAt)}</div>
                <div style={{ ...T.serif, fontSize: 18, fontWeight: 600, lineHeight: 1.35, color: T.ink, marginBottom: 10 }}>{post.title}</div>
                {post.excerpt && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>}
                <div style={{ fontSize: 13, fontWeight: 700, color: T.brown, marginTop: 16 }}>Đọc thêm →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════════ */
function Gallery({ images }) {
  while (images.length < 8) images.push(null);
  return (
    <section style={{ paddingBottom: 80 }}>
      <div style={{ textAlign: 'center', padding: '0 32px 36px' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: T.brown, fontWeight: 700, marginBottom: 10 }}>@nenthom.abc</div>
        <h2 style={{ ...T.serif, fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 600, margin: 0, color: T.ink }}>Theo dõi trên Instagram</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 4, maxWidth: '100%' }}>
        {images.slice(0, 8).map((src, i) => (
          <div key={i} className="gallery-cell" style={{ aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer', background: src ? undefined : GRADS[i % GRADS.length] }}>
            {src && <img src={src} alt="" className="gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s' }} />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION HEADING (shared)
══════════════════════════════════════════════════ */
function SectionHead({ eyebrow, title, align = 'center', mb = 0 }) {
  return (
    <div style={{ textAlign: align }}>
      {eyebrow && <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: T.brown, fontWeight: 700, marginBottom: 10 }}>{eyebrow}</div>}
      <h2 style={{ ...T.serif, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, margin: 0, color: T.ink, marginBottom: mb }}>{title}</h2>
    </div>
  );
}
