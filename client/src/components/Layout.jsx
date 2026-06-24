import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';
import { I } from '../icons.jsx';

const MENU = [
  { label: 'Trang chủ', to: '/', end: true },
  { label: 'Sản phẩm', to: '/products' },
  { label: 'Tìm mùi hương', to: '/quiz' },
  { label: 'Blog', to: '/blog' },
  { label: 'Liên hệ', to: '/contact' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newsMsg, setNewsMsg] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      setShowTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/newsletter/subscribe', { email });
      setNewsMsg(r.data.message);
      setEmail('');
    } catch (err) {
      setNewsMsg(err.message);
    }
  };

  const doLogout = async () => { await logout(); setMenuOpen(false); navigate('/'); };
  const cartCount = cart?.count || 0;

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">Miễn phí giao hàng toàn quốc cho đơn từ 500.000₫ — Quà tặng kèm với mọi đơn hàng</div>

      <header className={'header' + (scrolled ? ' scrolled' : '')}>
        <div className="container header-in">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <div className="logo-mark"><span></span></div>
            <div style={{ lineHeight: 1 }}>
              <div className="serif" style={{ fontSize: 23, fontWeight: 600, letterSpacing: 1 }}>Nến Thơm ABC</div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--wood)', textTransform: 'uppercase', marginTop: 2 }}>Maison de Bougie</div>
            </div>
          </Link>

          <nav className="nav">
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>{m.label}</NavLink>
            ))}
          </nav>

          <div className="icons">
            <span className="icon-btn desktop-only" title="Tìm kiếm" onClick={() => navigate('/products')}>{I.search}</span>
            <span className="icon-btn desktop-only" title="Tài khoản" onClick={() => navigate(user ? '/account' : '/login')}>{I.user}</span>
            {isAdmin && <span className="icon-btn desktop-only" title="Quản trị" onClick={() => navigate('/admin')}>{I.box}</span>}
            <span className="icon-btn" title="Giỏ hàng" onClick={() => navigate('/cart')}>{I.bag}{cartCount > 0 && <span className="badge">{cartCount}</span>}</span>
            <span className="hamb" onClick={() => setMenuOpen(true)}><i></i><i></i><i></i></span>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={'mmenu' + (menuOpen ? ' open' : '')}>
        <div className="ov" onClick={() => setMenuOpen(false)}></div>
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="serif" style={{ fontSize: 22, fontWeight: 600 }}>Menu</span>
            <span className="x" onClick={() => setMenuOpen(false)}>×</span>
          </div>
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} onClick={() => setMenuOpen(false)}>{m.label}</NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/account" onClick={() => setMenuOpen(false)}>Tài khoản</NavLink>
              {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Quản trị</NavLink>}
              <a onClick={doLogout}>Đăng xuất</a>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập / Đăng ký</NavLink>
          )}
        </div>
      </div>

      <main className="main store" style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        <div className="container cols">
          <div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: 'var(--cream)', letterSpacing: 1, marginBottom: 14 }}>Nến Thơm ABC</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#9a9082', maxWidth: 280, margin: 0 }}>Nến thơm thủ công từ tinh dầu thiên nhiên và sáp đậu nành cao cấp. Mang sự thư thái về ngôi nhà của bạn.</p>
          </div>
          <div>
            <h4>Cửa hàng</h4>
            <div className="lcol">
              <Link to="/products">Tất cả sản phẩm</Link>
              <Link to="/quiz">Tìm mùi hương</Link>
              <Link to="/relax">Góc thư giãn</Link>
              <Link to="/blog">Blog</Link>
            </div>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <div className="lcol">
              <Link to="/pages/shipping-policy">Chính sách giao hàng</Link>
              <Link to="/pages/return-policy">Đổi trả & hoàn tiền</Link>
              <Link to="/pages/faq">Câu hỏi thường gặp</Link>
              <Link to="/contact">Liên hệ</Link>
            </div>
          </div>
          <div>
            <h4>Nhận ưu đãi</h4>
            <p style={{ fontSize: 13, color: '#9a9082', margin: '0 0 14px' }}>Đăng ký để nhận 10% cho đơn đầu tiên.</p>
            <form onSubmit={subscribe} style={{ display: 'flex', gap: 8 }}>
              <input className="inp" type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ background: '#2a221a', border: '1px solid #3a3025', color: 'var(--cream)' }} />
              <button className="btn btn-primary btn-sm">Đăng ký</button>
            </form>
            {newsMsg && <p style={{ fontSize: 13, marginTop: 8, color: 'var(--beige)' }}>{newsMsg}</p>}
          </div>
        </div>
        <div className="bottom"><div className="container">
          <span>© {new Date().getFullYear()} Nến Thơm ABC. Mọi quyền được bảo lưu.</span>
          <span>Điều khoản · Bảo mật · Cookie</span>
        </div></div>
      </footer>

      <button className="backtop" aria-label="Lên đầu trang" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ transform: showTop ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.8)', opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'auto' : 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
      </button>
    </div>
  );
}
