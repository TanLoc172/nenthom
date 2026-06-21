import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import AuthShell from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const r = await api.post('/auth/forgot-password', { email });
    setMsg(r.data.message);
  };

  return (
    <AuthShell title="Quên mật khẩu" subtitle="Nhập email để nhận liên kết đặt lại mật khẩu">
      {msg ? <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>{msg}</p> : (
        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <input className="inp" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn btn-primary btn-block btn-lg">Gửi liên kết đặt lại</button>
        </form>
      )}
      <div style={{ textAlign: 'center', fontSize: 13, marginTop: 20 }}><Link className="tlink" style={{ color: 'var(--wood)', fontWeight: 600 }} to="/login">← Đăng nhập</Link></div>
    </AuthShell>
  );
}
