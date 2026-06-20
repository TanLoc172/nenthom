import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [email, setEmail] = useState('');
  const [newsMsg, setNewsMsg] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>Nến Thơm ABC</Link>
          <nav className="nav">
            <NavLink to="/" end>Trang chủ</NavLink>
            <NavLink to="/products">Sản phẩm</NavLink>
            <NavLink to="/quiz">Tìm mùi hương</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/contact">Liên hệ</NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/cart" className="cart-link" aria-label="Giỏ hàng">🛒{cart.count > 0 && <span className="badge">{cart.count}</span>}</Link>
            {user ? (
              <div className="user-menu desktop-only">
                <Link to="/account">{user.profile?.firstName || 'Tài khoản'}</Link>
                {isAdmin && <Link to="/admin">Quản trị</Link>}
                <button onClick={doLogout}>Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="desktop-only" style={{ fontWeight: 500 }}>Đăng nhập</Link>
            )}
            <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={`mobile-menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <NavLink to="/" end>Trang chủ</NavLink>
        <NavLink to="/products">Sản phẩm</NavLink>
        <NavLink to="/quiz">Tìm mùi hương</NavLink>
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/contact">Liên hệ</NavLink>
        {user ? (
          <>
            <NavLink to="/account">Tài khoản</NavLink>
            {isAdmin && <NavLink to="/admin">Quản trị</NavLink>}
            <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={doLogout}>Đăng xuất</button>
          </>
        ) : (
          <NavLink to="/login">Đăng nhập</NavLink>
        )}
      </nav>

      <main className={isHome ? 'main main--full' : 'main'}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div style={{ maxWidth: 320 }}>
            <strong>Nến Thơm ABC</strong>
            <p style={{ fontSize: 14, marginTop: 0 }}>Nến thơm thủ công từ sáp đậu nành tự nhiên — thắp sáng những khoảnh khắc thư giãn của bạn.</p>
            <form onSubmit={subscribe} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="btn btn-sm">Đăng ký</button>
            </form>
            {newsMsg && <p style={{ fontSize: 13, marginTop: 8 }}>{newsMsg}</p>}
          </div>
          <div>
            <strong>Hỗ trợ</strong>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <Link to="/pages/faq">Câu hỏi thường gặp</Link>
              <Link to="/pages/shipping-policy">Chính sách vận chuyển</Link>
              <Link to="/pages/return-policy">Chính sách đổi trả</Link>
              <Link to="/pages/warranty">Bảo hành & cam kết</Link>
            </div>
          </div>
          <div>
            <strong>Khám phá</strong>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <Link to="/quiz">Tìm mùi hương của bạn</Link>
              <Link to="/relax">Góc thư giãn</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Liên hệ</Link>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} Nến Thơm ABC. Thắp sáng từng khoảnh khắc.</div>
      </footer>
    </div>
  );
}
