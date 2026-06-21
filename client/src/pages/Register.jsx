import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

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
    <AuthShell title="Tạo tài khoản" subtitle="Tham gia để nhận ưu đãi & theo dõi đơn hàng">
      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <input className="inp" placeholder="Họ" value={form.firstName} onChange={set('firstName')} />
          <input className="inp" placeholder="Tên" value={form.lastName} onChange={set('lastName')} />
        </div>
        <input className="inp" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="inp" type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={form.password} onChange={set('password')} required minLength={6} />
        {error && <div style={{ fontSize: 13, color: '#c0563f' }}>{error}</div>}
        <button className="btn btn-primary btn-block btn-lg">Tạo tài khoản</button>
      </form>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
        Đã có tài khoản? <Link className="tlink" style={{ color: 'var(--wood)', fontWeight: 600 }} to="/login">Đăng nhập</Link>
      </div>
    </AuthShell>
  );
}
