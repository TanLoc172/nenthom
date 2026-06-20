import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1>Đăng ký</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Họ</label><input value={form.firstName} onChange={set('firstName')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Tên</label><input value={form.lastName} onChange={set('lastName')} /></div>
        </div>
        <div className="field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="field"><label>Mật khẩu</label><input type="password" value={form.password} onChange={set('password')} required minLength={6} /></div>
        <button className="btn" style={{ width: '100%' }}>Tạo tài khoản</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
}
