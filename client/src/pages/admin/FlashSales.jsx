import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatDate, formatVnd } from '../../utils/format.js';

const blank = { name: '', description: '', startTime: '', endTime: '', isActive: true, items: [] };

export default function AdminFlashSales() {
  const [sales, setSales] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/admin/flash-sales'); setSales(r.data); } catch { }
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
    if (!confirm('Xoá flash sale này?')) return;
    try { await api.delete(`/admin/flash-sales/${id}`); load(); } catch (err) { alert(err.message); }
  };

  const updateItem = (i, patch) => {
    const its = editing.items.map((it, j) => j === i ? { ...it, ...patch } : it);
    setEditing({ ...editing, items: its });
  };

  const removeItem = (i) => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) });

  const addItem = () => setEditing({
    ...editing,
    items: [...editing.items, { productId: '', productName: '', slug: '', imageUrl: '', originalPrice: 0, salePrice: 0, saleQuantity: 50, soldCount: 0 }],
  });

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
        <div className="acard" style={{ marginBottom: 24 }}>
          <div className="acard-header">{editing._id ? 'Sửa Flash Sale' : 'Tạo Flash Sale mới'}</div>
          <form onSubmit={save} className="acard-body">
            {/* Thông tin chung */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Tên chương trình *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required placeholder="VD: Flash Sale Cuối Tuần" />
              </div>
              <div className="field">
                <label>Bắt đầu</label>
                <input type="datetime-local" value={(editing.startTime || '').slice(0, 16)} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} />
              </div>
              <div className="field">
                <label>Kết thúc</label>
                <input type="datetime-local" value={(editing.endTime || '').slice(0, 16)} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} />
              </div>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Mô tả</label>
                <input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Mô tả ngắn về chương trình..." />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              Kích hoạt ngay
            </label>

            {/* Sản phẩm */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Sản phẩm khuyến mãi ({editing.items.length})</h4>
              <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Thêm sản phẩm</button>
            </div>

            {editing.items.length === 0 && (
              <p className="muted" style={{ textAlign: 'center', padding: '24px 0', border: '1.5px dashed var(--border)', borderRadius: 10 }}>Chưa có sản phẩm. Nhấn "+ Thêm sản phẩm" để bắt đầu.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editing.items.map((it, i) => (
                <FlashItem key={i} item={it} index={i} onChange={(patch) => updateItem(i, patch)} onRemove={() => removeItem(i)} />
              ))}
            </div>

            {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button className="btn">Lưu</button>
              <button type="button" className="btn btn-outline" onClick={() => { setEditing(null); setError(''); }}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách */}
      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>SP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sales.map((f) => {
              const st = {
                active: ['Đang diễn ra', 'st-delivered'],
                scheduled: ['Sắp diễn ra', 'st-confirmed'],
                ended: ['Đã kết thúc', 'st-cancelled'],
                inactive: ['Tạm dừng', 'st-pending'],
              }[f.status] || [f.status, 'st-pending'];
              return (
                <tr key={f._id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{formatDate(f.startTime)}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{formatDate(f.endTime)}</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge-status ${st[1]}`}>{st[0]}</span></td>
                  <td style={{ textAlign: 'center' }}>{f.items?.length || 0}</td>
                  <td>
                    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(f)}>Sửa</button>
                      <button className="btn btn-outline btn-sm" onClick={() => remove(f._id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sales.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có Flash Sale nào.</p>}
      </div></div>
    </div>
  );
}

/* ── FlashItem: 1 dòng sản phẩm với product picker ── */
function FlashItem({ item, onChange, onRemove }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await api.get(`/admin/products?q=${encodeURIComponent(q)}&limit=8`);
      setResults(r.data.products || r.data || []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const pick = (p) => {
    const v = p.variants?.[0];
    onChange({
      productId: p._id,
      productName: p.name,
      slug: p.slug,
      imageUrl: p.images?.[0] || v?.images?.[0] || '',
      originalPrice: v?.price || 0,
      salePrice: item.salePrice || Math.round((v?.price || 0) * 0.8 / 1000) * 1000,
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const discount = item.originalPrice > 0
    ? Math.round((1 - item.salePrice / item.originalPrice) * 100)
    : 0;

  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-soft)', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Ảnh */}
        <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', background: 'var(--border)', flexShrink: 0, border: '1px solid var(--border)' }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🕯️</div>}
        </div>

        {/* Nội dung */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Product picker */}
          {item.productId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{item.productName}</span>
              <button type="button" onClick={() => onChange({ productId: '', productName: '', slug: '', imageUrl: '', originalPrice: 0 })}
                style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Đổi SP
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                placeholder="Tìm sản phẩm..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                style={{ width: '100%', padding: '7px 12px', borderRadius: 7, border: '1.5px solid var(--border)', fontSize: 13 }}
              />
              {searching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--muted)' }}>…</span>}
              {open && results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, maxHeight: 240, overflowY: 'auto' }}>
                  {results.map((p) => (
                    <div key={p._id} onClick={() => pick(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      {(p.images?.[0] || p.variants?.[0]?.images?.[0]) && (
                        <img src={p.images?.[0] || p.variants?.[0]?.images?.[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                      )}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatVnd(p.variants?.[0]?.price || 0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Giá & số lượng */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Giá gốc (₫)</label>
              <input type="number" value={item.originalPrice} onChange={(e) => onChange({ originalPrice: Number(e.target.value) })} style={{ fontSize: 13 }} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Giá sale (₫)</label>
              <input type="number" value={item.salePrice} onChange={(e) => onChange({ salePrice: Number(e.target.value) })} style={{ fontSize: 13 }} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Số lượng</label>
              <input type="number" value={item.saleQuantity} onChange={(e) => onChange({ saleQuantity: Number(e.target.value) })} style={{ fontSize: 13 }} />
            </div>
            {discount > 0 && (
              <div style={{ textAlign: 'center', background: '#c0563f', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                -{discount}%
              </div>
            )}
          </div>
        </div>

        {/* Xóa */}
        <button type="button" onClick={onRemove}
          style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee', border: '1px solid #fcc', color: '#c0563f', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          ×
        </button>
      </div>
    </div>
  );
}
