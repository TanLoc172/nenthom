import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell quoteIndex={0}>
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 32, fontWeight: 600, color: '#2C2C2C', margin: '0 0 6px' }}>Đăng nhập</h1>
      <p style={{ fontSize: 13, color: '#9b9289', margin: '0 0 28px' }}>Chào mừng bạn trở lại Nến Thơm ABC</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Email</label>
          <input className="inp" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
          <input className="inp" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
        </div>
        {error && <div style={{ fontSize: 13, color: '#c0563f', background: '#fdf0ee', border: '1px solid #f5c4bb', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <Link to="/forgot-password" style={{ color: '#8B6B4A', fontWeight: 600, textDecoration: 'none' }}>Quên mật khẩu?</Link>
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ height: 46, borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#9b9289', marginTop: 24 }}>
        Chưa có tài khoản?{' '}
        <Link to="/register" style={{ color: '#8B6B4A', fontWeight: 600, textDecoration: 'none' }}>Đăng ký ngay</Link>
      </div>
    </AuthShell>
  );
}
