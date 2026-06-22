import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell quoteIndex={1}>
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 32, fontWeight: 600, color: '#2C2C2C', margin: '0 0 6px' }}>Đăng ký</h1>
      <p style={{ fontSize: 13, color: '#9b9289', margin: '0 0 28px' }}>Tạo tài khoản để trải nghiệm mua sắm tốt hơn</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Họ</label>
            <input className="inp" placeholder="Nguyễn" value={form.lastName} onChange={set('lastName')} style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Tên</label>
            <input className="inp" placeholder="Văn A" value={form.firstName} onChange={set('firstName')} style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Email *</label>
          <input className="inp" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 6 }}>Mật khẩu *</label>
          <input className="inp" type="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={set('password')} required minLength={6} style={{ height: 44, borderRadius: 10, borderColor: '#EDE5D8' }} />
        </div>
        {error && <div style={{ fontSize: 13, color: '#c0563f', background: '#fdf0ee', border: '1px solid #f5c4bb', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
        <button className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ height: 46, borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
          {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#9b9289', marginTop: 24 }}>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: '#8B6B4A', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link>
      </div>
    </AuthShell>
  );
}
