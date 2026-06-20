import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';
import RichText from '../../components/RichText.jsx';
import { formatDate } from '../../utils/format.js';

const blank = { title: '', slug: '', excerpt: '', content: '', thumbnailUrl: '', category: '', authorName: '', status: 'draft' };

export default function AdminPosts() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/admin/posts'); setItems(r.data); } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing._id) await api.put(`/admin/posts/${editing._id}`, editing);
      else await api.post('/admin/posts', editing);
      setEditing(null); load();
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => {
    if (!confirm('Xoá bài viết?')) return;
    try { await api.delete(`/admin/posts/${id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Blog</li></ul>
          <h1>Blog / Tin tức</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing({ ...blank })}>+ Viết bài</button>
      </div>

      {editing && (
        <div className="acard"><div className="acard-header">{editing._id ? 'Sửa bài viết' : 'Viết bài mới'}</div>
        <form onSubmit={save} className="acard-body">
          <div className="field"><label>Tiêu đề *</label><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
          <div className="field"><label>Slug</label><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
          <div className="field"><label>Tóm tắt</label><input value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
          <div className="field"><label>Ảnh đại diện</label>
            <ImageUploader value={editing.thumbnailUrl ? [editing.thumbnailUrl] : []} folder="posts" onChange={(urls) => setEditing({ ...editing, thumbnailUrl: urls[urls.length - 1] || '' })} />
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Danh mục</label><input value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Tác giả</label><input value={editing.authorName || ''} onChange={(e) => setEditing({ ...editing, authorName: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Trạng thái</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Nháp</option><option value="published">Xuất bản</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Nội dung</label><RichText value={editing.content} onChange={(html) => setEditing({ ...editing, content: html })} /></div>
          {error && <p className="error" style={{ margin: '8px 0 0' }}>{error}</p>}
          <div><button className="btn">Lưu</button><button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => { setEditing(null); setError(''); }}>Huỷ</button></div>
        </form></div>
      )}

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Tiêu đề</th><th>Danh mục</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th>Xuất bản</th><th style={{ textAlign: 'center' }}>Lượt xem</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
                    {p.thumbnailUrl ? <img src={p.thumbnailUrl} className="item-img" alt="" /> : <div className="item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</div>}
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                  </div>
                </td>
                <td className="muted">{p.category || '—'}</td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${p.status === 'published' ? 'st-delivered' : 'st-pending'}`}>{p.status === 'published' ? 'Xuất bản' : 'Nháp'}</span></td>
                <td className="muted" style={{ fontSize: 13 }}>{formatDate(p.publishedAt)}</td>
                <td style={{ textAlign: 'center' }}>{p.viewCount}</td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>Sửa</button><button className="btn btn-outline btn-sm" onClick={() => remove(p._id)}>Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có bài viết.</p>}
      </div></div>
    </div>
  );
}
