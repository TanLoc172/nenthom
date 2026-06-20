import { useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const r = await api.post('/contact', form);
      setMsg(r.data.message);
      setForm({ ...form, subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 className="section-title">Liên hệ</h1>
      {msg && <p className="muted">{msg}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit} className="card">
        <div className="field"><label>Họ tên *</label><input value={form.fullName} onChange={set('fullName')} required /></div>
        <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="field"><label>Tiêu đề</label><input value={form.subject} onChange={set('subject')} /></div>
        <div className="field"><label>Nội dung *</label><textarea rows={5} value={form.message} onChange={set('message')} required /></div>
        <button className="btn">Gửi</button>
      </form>
    </div>
  );
}
