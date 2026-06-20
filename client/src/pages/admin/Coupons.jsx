import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatVnd, formatDate } from '../../utils/format.js';

const blank = { code: '', discountType: 'fixed_amount', discountValue: 0, minOrderValue: 0, maxDiscountAmount: 0, usageLimit: 0, isActive: true, startDate: '', endDate: '' };

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/admin/coupons').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const body = { ...editing, discountValue: Number(editing.discountValue), minOrderValue: Number(editing.minOrderValue), maxDiscountAmount: Number(editing.maxDiscountAmount) || null, usageLimit: Number(editing.usageLimit) || null };
    if (editing._id) await api.put(`/admin/coupons/${editing._id}`, body);
    else await api.post('/admin/coupons', body);
    setEditing(null); load();
  };
  const remove = async (id) => { if (confirm('Xoá mã?')) { await api.delete(`/admin/coupons/${id}`); load(); } };

  const now = new Date();
  const isLive = (c) => c.isActive && (!c.endDate || new Date(c.endDate) >= now) && (!c.startDate || new Date(c.startDate) <= now);
  const kpis = [
    ['Tổng mã', items.length],
    ['Đang hoạt động', items.filter(isLive).length],
    ['Hết hạn', items.filter((c) => c.endDate && new Date(c.endDate) < now).length],
    ['Lượt đã dùng', items.reduce((s, c) => s + (c.usedCount || 0), 0)],
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Mã giảm giá</li></ul>
          <h1>Mã giảm giá</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing({ ...blank })}>+ Tạo mã</button>
      </div>

      <div className="stats">
        {kpis.map(([l, v]) => <div className="stat" key={l}><div className="v" style={{ fontSize: 22 }}>{v}</div><div className="l">{l}</div></div>)}
      </div>

      {editing && (
        <div className="acard"><div className="acard-header">{editing._id ? 'Chỉnh sửa' : 'Tạo'} mã giảm giá</div>
          <form onSubmit={save} className="acard-body">
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Mã code *</label><input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} required /></div>
              <div className="field" style={{ flex: 1 }}><label>Loại</label>
                <select value={editing.discountType} onChange={(e) => setEditing({ ...editing, discountType: e.target.value })}><option value="fixed_amount">Số tiền</option><option value="percentage">Phần trăm</option></select>
              </div>
              <div className="field" style={{ flex: 1 }}><label>Giá trị</label><input type="number" value={editing.discountValue} onChange={(e) => setEditing({ ...editing, discountValue: e.target.value })} /></div>
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Đơn tối thiểu</label><input type="number" value={editing.minOrderValue} onChange={(e) => setEditing({ ...editing, minOrderValue: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Giảm tối đa</label><input type="number" value={editing.maxDiscountAmount || 0} onChange={(e) => setEditing({ ...editing, maxDiscountAmount: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Giới hạn lượt</label><input type="number" value={editing.usageLimit || 0} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value })} /></div>
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Bắt đầu</label><input type="date" value={(editing.startDate || '').slice(0, 10)} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Kết thúc</label><input type="date" value={(editing.endDate || '').slice(0, 10)} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} /></div>
            </div>
            <label><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Kích hoạt</label>
            <div style={{ marginTop: 12 }}><button className="btn">Lưu</button><button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => setEditing(null)}>Huỷ</button></div>
          </form>
        </div>
      )}

      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Mã code</th><th style={{ textAlign: 'center' }}>Loại</th><th style={{ textAlign: 'center' }}>Giá trị</th><th style={{ textAlign: 'right' }}>Đơn tối thiểu</th><th>Thời hạn</th><th style={{ textAlign: 'center' }}>Đã dùng</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{c.code}</span></td>
                <td style={{ textAlign: 'center' }} className="muted">{c.discountType === 'percentage' ? '%' : 'VNĐ'}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : formatVnd(c.discountValue)}</td>
                <td style={{ textAlign: 'right' }}>{formatVnd(c.minOrderValue)}</td>
                <td className="muted" style={{ fontSize: 13 }}>{c.startDate ? formatDate(c.startDate) : '—'} → {c.endDate ? formatDate(c.endDate) : '—'}</td>
                <td style={{ textAlign: 'center' }}>{c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                <td style={{ textAlign: 'center' }}><span className={`badge-status ${isLive(c) ? 'st-delivered' : 'st-cancelled'}`}>{isLive(c) ? 'Hoạt động' : 'Tạm dừng'}</span></td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => setEditing(c)}>Sửa</button><button className="btn btn-outline btn-sm" onClick={() => remove(c._id)}>Xoá</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có mã giảm giá.</p>}
      </div></div>
    </div>
  );
}
