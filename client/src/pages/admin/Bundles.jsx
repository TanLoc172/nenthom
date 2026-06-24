import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

const blank = { mainProductId: '', mainProductName: '', companions: [], discountPercent: 10, label: 'Mua kèm tiết kiệm', isActive: true };

/* ── Searchable product picker ── */
function ProductPicker({ label, value, onChange }) {
  const [q, setQ] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const search = (v) => {
    setQ(v); setOpen(true);
    clearTimeout(timer.current);
    if (!v.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      try { const r = await api.get('/admin/products', { params: { q: v, limit: 8 } }); setResults(r.data.items || []); } catch { }
    }, 280);
  };

  const pick = (p) => {
    const v0 = p.variants?.[0];
    onChange({ productId: p._id, productName: p.name, slug: p.slug, imageUrl: p.images?.[0] || v0?.images?.[0] || '' });
    setQ(p.name); setResults([]); setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6560', display: 'block', marginBottom: 4 }}>{label}</label>
      <input className="inp" value={q} onChange={(e) => search(e.target.value)}
        onFocus={() => q && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Tìm tên sản phẩm…" style={{ height: 38, fontSize: 13 }} />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 99, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
          {results.map((p) => {
            const v0 = p.variants?.[0];
            return (
              <div key={p._id} onMouseDown={() => pick(p)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                <img src={p.images?.[0] || v0?.images?.[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: '#f0ebe3', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9b9289' }}>{p.slug}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/admin/bundles'); setBundles(r.data); } catch { }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setError('');
    if (!editing.mainProductId) return setError('Chưa chọn sản phẩm chính');
    if (editing.companions.length === 0) return setError('Thêm ít nhất 1 sản phẩm mua kèm');
    try {
      if (editing._id) await api.put(`/admin/bundles/${editing._id}`, editing);
      else await api.post('/admin/bundles', editing);
      setEditing(null); load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    if (!confirm('Xoá bundle này?')) return;
    try { await api.delete(`/admin/bundles/${id}`); load(); } catch (err) { alert(err.message); }
  };

  const setMain = (p) => setEditing({ ...editing, mainProductId: p.productId, mainProductName: p.productName });

  const addCompanion = () => setEditing({ ...editing, companions: [...editing.companions, { productId: '', productName: '', slug: '', imageUrl: '' }] });

  const setCompanion = (i, p) => {
    const companions = editing.companions.map((c, j) => j === i ? { ...c, productId: p.productId, productName: p.productName, slug: p.slug, imageUrl: p.imageUrl } : c);
    setEditing({ ...editing, companions });
  };

  const removeCompanion = (i) => setEditing({ ...editing, companions: editing.companions.filter((_, j) => j !== i) });

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Đề xuất mua kèm</li></ul>
          <h1>Đề xuất mua kèm</h1>
        </div>
        <button className="btn" onClick={() => setEditing({ ...blank })}>+ Tạo bundle</button>
      </div>

      {/* List */}
      <div className="acard"><div className="acard-body p0">
        <table className="table">
          <thead><tr><th>Sản phẩm chính</th><th>Mua kèm</th><th style={{ textAlign: 'center' }}>Giảm</th><th style={{ textAlign: 'center' }}>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b._id}>
                <td style={{ fontWeight: 600 }}>{b.mainProductName || '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(b.companions || []).map((c, i) => (
                      <span key={i} style={{ fontSize: 12, background: '#f0ebe3', borderRadius: 6, padding: '2px 8px' }}>{c.productName}</span>
                    ))}
                    {b.companions?.length === 0 && <span className="muted" style={{ fontSize: 13 }}>—</span>}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--wood)' }}>{b.discountPercent}%</span></td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge-status ${b.isActive ? 'st-delivered' : 'st-cancelled'}`}>{b.isActive ? 'Hiện' : 'Ẩn'}</span>
                </td>
                <td>
                  <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...b })}>Sửa</button>
                    <button className="btn btn-outline btn-sm" style={{ color: '#c0563f', borderColor: '#c0563f' }} onClick={() => remove(b._id)}>Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bundles.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 48 }}>Chưa có bundle nào.</p>}
      </div></div>

      {/* Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <form onSubmit={save} style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{editing._id ? 'Sửa bundle' : 'Tạo bundle mới'}</h2>
              <button type="button" onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9b9289' }}>×</button>
            </div>

            {/* Main product */}
            <div style={{ background: '#faf6f0', borderRadius: 12, padding: 16 }}>
              <ProductPicker
                label="Sản phẩm chính *"
                value={{ name: editing.mainProductName }}
                onChange={setMain}
              />
              {editing.mainProductId && (
                <div style={{ fontSize: 12, color: 'var(--wood)', marginTop: 6 }}>✓ {editing.mainProductName}</div>
              )}
            </div>

            {/* Companions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Sản phẩm mua kèm *</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addCompanion}>+ Thêm</button>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {editing.companions.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#faf6f0', borderRadius: 10, padding: 12 }}>
                    {c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <ProductPicker label={`Sản phẩm ${i + 1}`} value={{ name: c.productName }} onChange={(p) => setCompanion(i, p)} />
                    </div>
                    <button type="button" onClick={() => removeCompanion(i)} style={{ background: 'none', border: 'none', color: '#c0563f', cursor: 'pointer', fontSize: 18, paddingBottom: 2 }}>×</button>
                  </div>
                ))}
                {editing.companions.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Chưa có sản phẩm mua kèm. Bấm "+ Thêm".</p>}
              </div>
            </div>

            {/* Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6560', display: 'block', marginBottom: 4 }}>Giảm giá mua kèm (%)</label>
                <input className="inp" type="number" min={1} max={80} value={editing.discountPercent}
                  onChange={(e) => setEditing({ ...editing, discountPercent: +e.target.value })}
                  style={{ height: 38, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6560', display: 'block', marginBottom: 4 }}>Nhãn hiển thị</label>
                <input className="inp" value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  style={{ height: 38, fontSize: 13 }} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              Hiển thị trên trang sản phẩm
            </label>

            {error && <div style={{ fontSize: 13, color: '#c0563f', background: '#fdf0ee', border: '1px solid #f5c4bb', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Huỷ</button>
              <button type="submit" className="btn">Lưu bundle</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
