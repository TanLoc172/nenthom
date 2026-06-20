import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

const blank = { name: '', description: '', startTime: '', endTime: '', isActive: true, items: [] };
const blankItem = () => ({ productId: '', productName: '', slug: '', imageUrl: '', originalPrice: 0, salePrice: 0, saleQuantity: 0, soldCount: 0 });

export default function AdminFlashSales() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/admin/flash-sales'); setItems(r.data); } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing._id) await api.put(`/admin/flash-sales/${editing._id}`, editing);
      else await api.post('/admin/flash-sales', editing);
      setEditing(null); load();
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => {
    if (!confirm('Xoá flash sale?')) return;
    try { await api.delete(`/admin/flash-sales/${id}`); load(); } catch (err) { alert(err.message); }
  };
  const setItem = (i, k, v) => {
    const its = [...editing.items];
    its[i] = { ...its[i], [k]: v };
    setEditing({ ...editing, items: its });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Flash Sale</li></ul>
          <h1>Flash Sale</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing({ ...blank })}>+ Tạo Flash Sale</button>
      </div>

      {editing && (
        <form onSubmit={save} className="acard acard-body">
          <div className="field"><label>Tên</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Bắt đầu</label><input type="datetime-local" value={(editing.startTime || '').slice(0, 16)} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Kết thúc</label><input type="datetime-local" value={(editing.endTime || '').slice(0, 16)} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} /></div>
          </div>
          <label><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Kích hoạt</label>

          <h4>Sản phẩm khuyến mãi</h4>
          <table className="table">
            <thead><tr><th>Product ID</th><th>Tên</th><th>Giá gốc</th><th>Giá sale</th><th>SL</th><th></th></tr></thead>
            <tbody>
              {editing.items.map((it, i) => (
                <tr key={i}>
                  <td><input value={it.productId} onChange={(e) => setItem(i, 'productId', e.target.value)} style={{ width: 200 }} /></td>
                  <td><input value={it.productName} onChange={(e) => setItem(i, 'productName', e.target.value)} /></td>
                  <td><input type="number" value={it.originalPrice} onChange={(e) => setItem(i, 'originalPrice', Number(e.target.value))} style={{ width: 100 }} /></td>
                  <td><input type="number" value={it.salePrice} onChange={(e) => setItem(i, 'salePrice', Number(e.target.value))} style={{ width: 100 }} /></td>
                  <td><input type="number" value={it.saleQuantity} onChange={(e) => setItem(i, 'saleQuantity', Number(e.target.value))} style={{ width: 70 }} /></td>
                  <td><button type="button" className="btn btn-outline" onClick={() => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) })}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-outline" onClick={() => setEditing({ ...editing, items: [...editing.items, blankItem()] })}>+ Thêm SP</button>
          {error && <p className="error" style={{ margin: '8px 0 0' }}>{error}</p>}
          <div style={{ marginTop: 12 }}><button className="btn">Lưu</button><button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => { setEditing(null); setError(''); }}>Huỷ</button></div>
        </form>
      )}

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Tên</th><th>Bắt đầu</th><th>Kết thúc</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th style={{ textAlign: 'center' }}>SP</th><th></th></tr></thead>
          <tbody>
            {items.map((f) => {
              const st = { active: ['Đang diễn ra', 'st-delivered'], scheduled: ['Sắp diễn ra', 'st-confirmed'], ended: ['Đã kết thúc', 'st-cancelled'], inactive: ['Tạm dừng', 'st-pending'] }[f.status] || [f.status, 'st-pending'];
              return (
                <tr key={f._id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{formatDate(f.startTime)}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{formatDate(f.endTime)}</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge-status ${st[1]}`}>{st[0]}</span></td>
                  <td style={{ textAlign: 'center' }}>{f.items?.length || 0}</td>
                  <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => setEditing(f)}>Sửa</button><button className="btn btn-outline btn-sm" onClick={() => remove(f._id)}>Xoá</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có Flash Sale.</p>}
      </div></div>
    </div>
  );
}
