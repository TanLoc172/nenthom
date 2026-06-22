import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const blank = { name: '', slug: '', parentId: '', description: '', imageUrl: '', isActive: true };

  const load = async () => {
    try { const r = await api.get('/categories/tree?all=true'); setCats(flatten(r.data)); } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...editing, parentId: editing.parentId || null };
      if (editing._id) await api.put(`/admin/categories/${editing._id}`, body);
      else await api.post('/admin/categories', body);
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => {
    if (!confirm('Xoá danh mục?')) return;
    try { await api.delete(`/admin/categories/${id}`); load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Danh mục</li></ul>
          <h1>Quản lý danh mục</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing({ ...blank })}>+ Thêm danh mục</button>
      </div>

      {editing && (
        <div className="acard"><div className="acard-header">{editing._id ? 'Sửa' : 'Thêm'} danh mục</div>
        <form onSubmit={save} className="acard-body" style={{ maxWidth: 520 }}>
          <div className="field"><label>Tên *</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
          <div className="field"><label>Slug</label><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
          <div className="field">
            <label>Danh mục cha</label>
            <select value={editing.parentId || ''} onChange={(e) => setEditing({ ...editing, parentId: e.target.value })}>
              <option value="">— Gốc —</option>
              {cats.filter((c) => c._id !== editing._id).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Mô tả</label><input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div className="field">
            <label>Hình ảnh</label>
            <ImageUploader
              folder="categories"
              value={editing.imageUrl ? [editing.imageUrl] : []}
              onChange={(urls) => setEditing({ ...editing, imageUrl: urls[urls.length - 1] || '' })}
            />
          </div>
          <label><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Hiển thị</label>
          {error && <p className="error" style={{ margin: '8px 0 0' }}>{error}</p>}
          <div style={{ marginTop: 12 }}>
            <button className="btn">Lưu</button>
            <button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => { setEditing(null); setError(''); }}>Huỷ</button>
          </div>
        </form></div>
      )}

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Ảnh</th><th>Tên</th><th>Slug</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c._id}>
                <td style={{ width: 52 }}>
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt={c.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-soft)', border: '1px solid var(--border)' }} />}
                </td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="muted" style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.slug}</td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${c.isActive ? 'st-delivered' : 'st-cancelled'}`}>{c.isActive ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...c, parentId: c.parentId || '' })}>Sửa</button>
                  <button className="btn btn-outline btn-sm" onClick={() => remove(c._id)}>Xoá</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {cats.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có danh mục.</p>}
      </div></div>
    </div>
  );
}

function flatten(tree, depth = 0, out = []) {
  for (const c of tree) {
    out.push({ ...c, name: `${'— '.repeat(depth)}${c.name}` });
    if (c.children?.length) flatten(c.children, depth + 1, out);
  }
  return out;
}
