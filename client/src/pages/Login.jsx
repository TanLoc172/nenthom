import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';
import AuthShell from '../components/AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState({ google: false, facebook: false });

  useEffect(() => { api.get('/auth/providers').then((r) => setProviders(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      await refresh();
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell title="Đăng nhập" subtitle="Chào mừng bạn trở lại Nến Thơm ABC">
      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <input className="inp" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="inp" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div style={{ fontSize: 13, color: '#c0563f' }}>{error}</div>}
        <div style={{ textAlign: 'right', fontSize: 13 }}><Link className="tlink" style={{ color: 'var(--wood)' }} to="/forgot-password">Quên mật khẩu?</Link></div>
        <button className="btn btn-primary btn-block btn-lg">Đăng nhập</button>
      </form>

      {(providers.google || providers.facebook) && (
        <div style={{ marginTop: 16 }}>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>hoặc</p>
          {providers.google && <a className="btn btn-outline btn-block" style={{ marginBottom: 8 }} href="/api/auth/google">Đăng nhập với Google</a>}
          {providers.facebook && <a className="btn btn-outline btn-block" href="/api/auth/facebook">Đăng nhập với Facebook</a>}
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
        Chưa có tài khoản? <Link className="tlink" style={{ color: 'var(--wood)', fontWeight: 600 }} to="/register">Đăng ký ngay</Link>
      </div>
    </AuthShell>
  );
}
