import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');

  useEffect(() => { api.get('/account/profile').then((r) => setProfile(r.data)); }, []);
  if (!profile) return <p>Đang tải…</p>;

  return (
    <div>
      <h1 className="section-title">Tài khoản</h1>
      <div className="row" style={{ marginBottom: 20 }}>
        <Link to="/orders" className="btn btn-outline">Đơn hàng</Link>
        <Link to="/wishlist" className="btn btn-outline">Yêu thích</Link>
        <span className="btn btn-outline">Điểm: {profile.profile.loyaltyPoints || 0}</span>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        {['profile', 'addresses', 'password'].map((t) => (
          <button key={t} className={tab === t ? 'btn' : 'btn btn-outline'} onClick={() => setTab(t)}>
            {t === 'profile' ? 'Hồ sơ' : t === 'addresses' ? 'Địa chỉ' : 'Mật khẩu'}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileForm profile={profile} setProfile={setProfile} />}
      {tab === 'addresses' && <Addresses />}
      {tab === 'password' && <PasswordForm />}
    </div>
  );
}

function ProfileForm({ profile, setProfile }) {
  const [saved, setSaved] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    await api.put('/account/profile', {
      firstName: profile.profile.firstName, lastName: profile.profile.lastName, phone: profile.phone,
    });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };
  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 480 }}>
      {saved && <p className="muted">✓ Đã lưu</p>}
      <div className="field"><label>Email</label><input value={profile.email} disabled /></div>
      <div className="field"><label>Họ</label><input value={profile.profile.firstName || ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, firstName: e.target.value } })} /></div>
      <div className="field"><label>Tên</label><input value={profile.profile.lastName || ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, lastName: e.target.value } })} /></div>
      <div className="field"><label>Điện thoại</label><input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
      <button className="btn">Lưu</button>
    </form>
  );
}

function Addresses() {
  const [list, setList] = useState([]);
  const [adding, setAdding] = useState(null);
  const blank = { recipientName: '', recipientPhone: '', addressLine1: '', ward: '', district: '', province: '', isDefault: false };

  const load = () => api.get('/account/addresses').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (adding.addressId) await api.put(`/account/addresses/${adding.addressId}`, adding);
    else await api.post('/account/addresses', adding);
    setAdding(null); load();
  };
  const remove = async (id) => { await api.delete(`/account/addresses/${id}`); load(); };

  return (
    <div style={{ maxWidth: 520 }}>
      <button className="btn" onClick={() => setAdding({ ...blank })}>+ Thêm địa chỉ</button>
      {adding && (
        <form onSubmit={save} className="card" style={{ margin: '12px 0' }}>
          <div className="field"><label>Người nhận</label><input value={adding.recipientName} onChange={(e) => setAdding({ ...adding, recipientName: e.target.value })} required /></div>
          <div className="field"><label>SĐT</label><input value={adding.recipientPhone} onChange={(e) => setAdding({ ...adding, recipientPhone: e.target.value })} required /></div>
          <div className="field"><label>Địa chỉ</label><input value={adding.addressLine1} onChange={(e) => setAdding({ ...adding, addressLine1: e.target.value })} required /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Phường/Xã</label><input value={adding.ward} onChange={(e) => setAdding({ ...adding, ward: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Quận/Huyện</label><input value={adding.district} onChange={(e) => setAdding({ ...adding, district: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Tỉnh/TP</label><input value={adding.province} onChange={(e) => setAdding({ ...adding, province: e.target.value })} /></div>
          </div>
          <label><input type="checkbox" checked={adding.isDefault} onChange={(e) => setAdding({ ...adding, isDefault: e.target.checked })} /> Đặt làm mặc định</label>
          <div style={{ marginTop: 12 }}><button className="btn">Lưu</button><button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => setAdding(null)}>Huỷ</button></div>
        </form>
      )}
      {list.map((a) => (
        <div key={a.addressId} className="card" style={{ marginTop: 12 }}>
          <strong>{a.recipientName}</strong> — {a.recipientPhone} {a.isDefault && <span className="tag" style={{ position: 'static' }}>Mặc định</span>}
          <p className="muted" style={{ margin: '6px 0' }}>{[a.addressLine1, a.ward, a.district, a.province].filter(Boolean).join(', ')}</p>
          <button className="btn btn-outline" onClick={() => setAdding(a)}>Sửa</button>
          <button className="btn btn-outline" style={{ marginLeft: 6 }} onClick={() => remove(a.addressId)}>Xoá</button>
        </div>
      ))}
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const r = await api.put('/account/password', form);
      setMsg(r.data.message);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) { setError(err.message); }
  };
  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 420 }}>
      {msg && <p className="muted">{msg}</p>}
      {error && <p className="error">{error}</p>}
      <div className="field"><label>Mật khẩu hiện tại</label><input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></div>
      <div className="field"><label>Mật khẩu mới</label><input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={6} /></div>
      <button className="btn">Đổi mật khẩu</button>
    </form>
  );
}
