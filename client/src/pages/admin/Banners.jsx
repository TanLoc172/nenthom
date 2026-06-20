import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';

const blank = { title: '', subtitle: '', mediaType: 'image', imageUrl: '', linkUrl: '', position: 'homepage', displayOrder: 0, isActive: true };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/admin/banners').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const body = { ...editing, displayOrder: Number(editing.displayOrder) };
    if (editing._id) await api.put(`/admin/banners/${editing._id}`, body);
    else await api.post('/admin/banners', body);
    setEditing(null); load();
  };
  const remove = async (id) => { if (confirm('Xoá banner?')) { await api.delete(`/admin/banners/${id}`); load(); } };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Banner</li></ul>
          <h1>Banner & Khuyến mãi</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing({ ...blank })}>+ Thêm banner</button>
      </div>

      {editing && (
        <form onSubmit={save} className="acard acard-body" style={{ maxWidth: 560 }}>
          <div className="field"><label>Tiêu đề</label><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div className="field"><label>Phụ đề</label><input value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
          <div className="field">
            <label>Ảnh</label>
            <ImageUploader value={editing.imageUrl ? [editing.imageUrl] : []} folder="banners" onChange={(urls) => setEditing({ ...editing, imageUrl: urls[urls.length - 1] || '' })} />
          </div>
          <div className="field"><label>Link</label><input value={editing.linkUrl || ''} onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })} /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Vị trí</label><input value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Thứ tự</label><input type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: e.target.value })} /></div>
          </div>
          <label><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Hiển thị</label>
          <div style={{ marginTop: 12 }}><button className="btn">Lưu</button><button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => setEditing(null)}>Huỷ</button></div>
        </form>
      )}

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Vị trí</th><th style={{ textAlign: 'center' }}>Thứ tự</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {items.map((b) => (
              <tr key={b._id}>
                <td>{b.imageUrl ? <img src={b.imageUrl} alt="" style={{ width: 90, height: 50, objectFit: 'cover', borderRadius: 6 }} /> : <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>}</td>
                <td style={{ fontWeight: 600 }}>{b.title}<div className="muted" style={{ fontSize: 12 }}>{b.subtitle}</div></td>
                <td className="muted">{b.position}</td>
                <td style={{ textAlign: 'center' }}>{b.displayOrder}</td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${b.isActive ? 'st-delivered' : 'st-cancelled'}`}>{b.isActive ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => setEditing(b)}>Sửa</button><button className="btn btn-outline btn-sm" onClick={() => remove(b._id)}>Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có banner.</p>}
      </div></div>
    </div>
  );
}
