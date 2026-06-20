import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

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

  if (!token) return <p className="muted">Liên kết không hợp lệ. <Link to="/forgot-password">Yêu cầu lại</Link></p>;

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1>Đặt lại mật khẩu</h1>
      {done ? <p className="muted">✓ Thành công! Đang chuyển tới đăng nhập…</p> : (
        <form onSubmit={submit}>
          {error && <p className="error">{error}</p>}
          <div className="field"><label>Mật khẩu mới</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <button className="btn" style={{ width: '100%' }}>Đặt lại</button>
        </form>
      )}
    </div>
  );
}
