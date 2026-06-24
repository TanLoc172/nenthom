import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function Card({ title, children, action }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 30, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: title ? 20 : 0 }}>
        {title && <div className="serif" style={{ fontSize: 24, fontWeight: 600 }}>{title}</div>}
        {action}
      </div>
      {children}
    </div>
  );
}

const Lbl = ({ children }) => <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>{children}</span>;

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { api.get('/account/profile').then((r) => setProfile(r.data)); }, []);
  if (!profile) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Đang tải…</p></div>;

  const name = [profile.profile.firstName, profile.profile.lastName].filter(Boolean).join(' ') || 'Tài khoản';
  const menu = [['profile', 'Hồ sơ'], ['addresses', 'Địa chỉ'], ['password', 'Mật khẩu']];
  const doLogout = async () => { await logout(); navigate('/'); };

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Tài khoản</b></div>
        <h1 className="serif">Xin chào, {name}</h1>
      </div></div>

      <div className="container acctgrid" style={{ padding: '40px 32px 90px', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 42, alignItems: 'start' }}>
        <aside style={{ position: 'sticky', top: 98 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 18, background: 'var(--soft)', borderRadius: 14, marginBottom: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%,#dcc09a,#8B6B4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flex: 'none' }}>{name.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div><div style={{ fontSize: 12, color: '#9b9289', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menu.map(([k, l]) => (
              <span key={k} onClick={() => setTab(k)} style={{ padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, background: tab === k ? 'var(--wood)' : 'transparent', color: tab === k ? '#fff' : 'var(--ink)' }}>{l}</span>
            ))}
            <Link to="/orders" style={{ padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Đơn hàng</Link>
            <span onClick={doLogout} style={{ padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#c0563f' }}>Đăng xuất</span>
          </div>
          <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--soft)', borderRadius: 12, fontSize: 13, color: 'var(--muted)' }}>Điểm tích lũy: <b style={{ color: 'var(--wood)' }}>{profile.profile.loyaltyPoints || 0}</b></div>
        </aside>

        <div>
          {tab === 'profile' && <ProfileForm profile={profile} setProfile={setProfile} />}
          {tab === 'addresses' && <Addresses />}
          {tab === 'password' && <PasswordForm />}
        </div>
      </div>
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
    <Card title="Thông tin cá nhân">
      <form onSubmit={save} style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
        {saved && <div style={{ fontSize: 13, color: '#1a7a45', fontWeight: 600 }}>✓ Đã lưu</div>}
        <label className="field"><Lbl>Email</Lbl><input className="inp" value={profile.email} disabled /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label className="field"><Lbl>Họ</Lbl><input className="inp" value={profile.profile.firstName || ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, firstName: e.target.value } })} /></label>
          <label className="field"><Lbl>Tên</Lbl><input className="inp" value={profile.profile.lastName || ''} onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, lastName: e.target.value } })} /></label>
        </div>
        <label className="field"><Lbl>Số điện thoại</Lbl><input className="inp" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="0901234567" /></label>
        <div><button className="btn btn-primary">Lưu thay đổi</button></div>
      </form>
    </Card>
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
    <Card title="Sổ địa chỉ" action={!adding && <button className="btn btn-outline btn-sm" onClick={() => setAdding({ ...blank })}>+ Thêm địa chỉ</button>}>
      {adding && (
        <form onSubmit={save} style={{ background: 'var(--soft)', borderRadius: 14, padding: 20, marginBottom: 18, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="inp" placeholder="Người nhận" value={adding.recipientName} onChange={(e) => setAdding({ ...adding, recipientName: e.target.value })} required />
            <input className="inp" placeholder="Số điện thoại" value={adding.recipientPhone} onChange={(e) => setAdding({ ...adding, recipientPhone: e.target.value })} required />
          </div>
          <input className="inp" placeholder="Địa chỉ" value={adding.addressLine1} onChange={(e) => setAdding({ ...adding, addressLine1: e.target.value })} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <input className="inp" placeholder="Phường/Xã" value={adding.ward} onChange={(e) => setAdding({ ...adding, ward: e.target.value })} />
            <input className="inp" placeholder="Quận/Huyện" value={adding.district} onChange={(e) => setAdding({ ...adding, district: e.target.value })} />
            <input className="inp" placeholder="Tỉnh/TP" value={adding.province} onChange={(e) => setAdding({ ...adding, province: e.target.value })} />
          </div>
          <label style={{ fontSize: 13, color: '#4a443c' }}><input type="checkbox" style={{ width: 'auto', marginRight: 6 }} checked={adding.isDefault} onChange={(e) => setAdding({ ...adding, isDefault: e.target.checked })} /> Đặt làm mặc định</label>
          <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-primary btn-sm">Lưu</button><button type="button" className="btn btn-outline btn-sm" onClick={() => setAdding(null)}>Hủy</button></div>
        </form>
      )}
      {list.length === 0 && !adding && <div style={{ fontSize: 14, color: '#9b9289', padding: '10px 0' }}>Bạn chưa lưu địa chỉ nào.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((a) => (
          <div key={a.addressId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #F0E9DD', borderRadius: 12, padding: '16px 18px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.recipientName} <span style={{ color: '#9b9289', fontWeight: 400 }}>· {a.recipientPhone}</span> {a.isDefault && <span className="tag" style={{ marginLeft: 6 }}>Mặc định</span>}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{[a.addressLine1, a.ward, a.district, a.province].filter(Boolean).join(', ')}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flex: 'none' }}>
              <span className="tlink" style={{ fontSize: 13, color: 'var(--wood)' }} onClick={() => setAdding(a)}>Sửa</span>
              <span className="tlink" style={{ fontSize: 13, color: '#c0563f' }} onClick={() => remove(a.addressId)}>Xóa</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
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
    <Card title="Đổi mật khẩu">
      <form onSubmit={submit} style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
        {msg && <div style={{ fontSize: 13, color: '#1a7a45', fontWeight: 600 }}>{msg}</div>}
        {error && <div style={{ fontSize: 13, color: '#c0563f' }}>{error}</div>}
        <label className="field"><Lbl>Mật khẩu hiện tại</Lbl><input className="inp" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></label>
        <label className="field"><Lbl>Mật khẩu mới</Lbl><input className="inp" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={6} /></label>
        <div><button className="btn btn-primary">Đổi mật khẩu</button></div>
      </form>
    </Card>
  );
}
