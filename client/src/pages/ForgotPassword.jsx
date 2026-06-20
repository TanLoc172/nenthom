import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const r = await api.post('/auth/forgot-password', { email });
    setMsg(r.data.message);
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1>Quên mật khẩu</h1>
      {msg ? <p className="muted">{msg}</p> : (
        <form onSubmit={submit}>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button className="btn" style={{ width: '100%' }}>Gửi liên kết đặt lại</button>
        </form>
      )}
      <p className="muted" style={{ marginTop: 12 }}><Link to="/login">← Đăng nhập</Link></p>
    </div>
  );
}
