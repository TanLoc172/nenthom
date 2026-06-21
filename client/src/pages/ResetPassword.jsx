import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import AuthShell from '../components/AuthShell.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) return (
    <AuthShell title="Liên kết không hợp lệ">
      <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>Liên kết đặt lại không hợp lệ. <Link className="tlink" style={{ color: 'var(--wood)', fontWeight: 600 }} to="/forgot-password">Yêu cầu lại</Link></p>
    </AuthShell>
  );

  return (
    <AuthShell title="Đặt lại mật khẩu">
      {done ? <p style={{ fontSize: 14, color: '#1a7a45', textAlign: 'center', fontWeight: 600 }}>✓ Thành công! Đang chuyển tới đăng nhập…</p> : (
        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          {error && <div style={{ fontSize: 13, color: '#c0563f' }}>{error}</div>}
          <input className="inp" type="password" placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button className="btn btn-primary btn-block btn-lg">Đặt lại</button>
        </form>
      )}
    </AuthShell>
  );
}
