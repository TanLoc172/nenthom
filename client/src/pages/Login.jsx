import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';

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
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1>Đăng nhập</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label>Mật khẩu</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn" style={{ width: '100%' }}>Đăng nhập</button>
      </form>

      {(providers.google || providers.facebook) && (
        <div style={{ marginTop: 12 }}>
          <p className="muted" style={{ textAlign: 'center' }}>hoặc</p>
          {providers.google && <a className="btn btn-outline" style={{ width: '100%', marginBottom: 8, textAlign: 'center' }} href="/api/auth/google">Đăng nhập với Google</a>}
          {providers.facebook && <a className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }} href="/api/auth/facebook">Đăng nhập với Facebook</a>}
        </div>
      )}

      <p className="muted" style={{ marginTop: 12 }}>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </p>
      <p className="muted">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </div>
  );
}
