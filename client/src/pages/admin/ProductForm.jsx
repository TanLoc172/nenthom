import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';

const emptyVariant = () => ({ sku: '', sizeLabel: '', price: 0, compareAtPrice: 0, stockQuantity: 0, weightGrams: 0, isActive: true });

export default function ProductForm() {
  const { id } = useParams();
  const editing = id && id !== 'new';
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', slug: '', shortDescription: '', description: '',
    category: { categoryId: '' },
    tags: '',
    scentProfile: { scentName: '', intensity: 5, notes: { top: '', middle: '', base: '' } },
    candleAttributes: { waxType: '', wickType: '', burnTimeHours: 0, origin: '' },
    images: [],
    variants: [emptyVariant()],
    isActive: true, isFeatured: false, isNew: false,
  });

  useEffect(() => {
    api.get('/categories/tree?all=true').then((r) => setCategories(flatten(r.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.get(`/admin/products/${id}`).then((r) => {
      const p = r.data;
      setForm({
        ...p,
        category: { categoryId: p.category?.categoryId || '' },
        tags: (p.tags || []).join(', '),
        scentProfile: {
          scentName: p.scentProfile?.scentName || '', intensity: p.scentProfile?.intensity || 5,
          notes: {
            top: (p.scentProfile?.notes?.top || []).join(', '),
            middle: (p.scentProfile?.notes?.middle || []).join(', '),
            base: (p.scentProfile?.notes?.base || []).join(', '),
          },
        },
        candleAttributes: p.candleAttributes || { waxType: '', wickType: '', burnTimeHours: 0, origin: '' },
        variants: p.variants?.length ? p.variants : [emptyVariant()],
      });
    });
  }, [id, editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setVariant = (i, k, v) => { const variants = [...form.variants]; variants[i] = { ...variants[i], [k]: v }; setForm({ ...form, variants }); };
  const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      tags: toList(form.tags),
      scentProfile: {
        ...form.scentProfile, intensity: Number(form.scentProfile.intensity),
        notes: { top: toList(form.scentProfile.notes.top), middle: toList(form.scentProfile.notes.middle), base: toList(form.scentProfile.notes.base) },
      },
      variants: form.variants.map((v) => ({ ...v, price: Number(v.price), compareAtPrice: Number(v.compareAtPrice) || undefined, stockQuantity: Number(v.stockQuantity), weightGrams: Number(v.weightGrams) || 0 })),
    };
    try {
      if (editing) await api.put(`/admin/products/${id}`, payload);
      else await api.post('/admin/products', payload);
      navigate('/admin/products');
    } catch (err) { setError(err.message); }
  };

  const ca = form.candleAttributes;
  const sp = form.scentProfile;

  return (
    <form onSubmit={submit}>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li><Link to="/admin/products">Sản phẩm</Link></li><li className="sep">/</li><li className="active">{editing ? 'Sửa' : 'Thêm mới'}</li></ul>
          <h1>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        </div>
        <Link to="/admin/products" className="btn btn-outline btn-sm">← Danh sách</Link>
      </div>

      {error && <div className="acard"><div className="acard-body"><p className="error" style={{ margin: 0 }}>{error}</p></div></div>}

      <div className="admin-split">
        {/* LEFT */}
        <div>
          <div className="acard"><div className="acard-header">🏷️ Thông tin cơ bản</div><div className="acard-body">
            <div className="field"><label>Tên sản phẩm *</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="field"><label>Slug (để trống = tự tạo)</label><input value={form.slug} onChange={set('slug')} /></div>
            <div className="field"><label>Mô tả ngắn</label><input value={form.shortDescription} onChange={set('shortDescription')} /></div>
            <div className="field"><label>Mô tả chi tiết</label><textarea rows={5} value={form.description} onChange={set('description')} /></div>
            <div className="field"><label>Tags (phẩy)</label><input value={form.tags} onChange={set('tags')} placeholder="handmade, gift, lavender" /></div>
          </div></div>

          <div className="acard"><div className="acard-header">🔥 Đặc tính nến</div><div className="acard-body">
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Loại sáp</label><input value={ca.waxType || ''} onChange={(e) => setForm({ ...form, candleAttributes: { ...ca, waxType: e.target.value } })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Loại bấc</label><input value={ca.wickType || ''} onChange={(e) => setForm({ ...form, candleAttributes: { ...ca, wickType: e.target.value } })} /></div>
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label>Giờ cháy</label><input type="number" value={ca.burnTimeHours || 0} onChange={(e) => setForm({ ...form, candleAttributes: { ...ca, burnTimeHours: Number(e.target.value) } })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Xuất xứ</label><input value={ca.origin || ''} onChange={(e) => setForm({ ...form, candleAttributes: { ...ca, origin: e.target.value } })} /></div>
            </div>
          </div></div>

          <div className="acard"><div className="acard-header">🌬️ Hương thơm</div><div className="acard-body">
            <div className="row">
              <div className="field" style={{ flex: 2 }}><label>Tên mùi</label><input value={sp.scentName} onChange={(e) => setForm({ ...form, scentProfile: { ...sp, scentName: e.target.value } })} /></div>
              <div className="field" style={{ flex: 1 }}><label>Cường độ (1-10)</label><input type="number" min="1" max="10" value={sp.intensity} onChange={(e) => setForm({ ...form, scentProfile: { ...sp, intensity: e.target.value } })} /></div>
            </div>
            {['top', 'middle', 'base'].map((k) => (
              <div className="field" key={k}><label>Hương {k === 'top' ? 'đầu' : k === 'middle' ? 'giữa' : 'cuối'} (phẩy)</label>
                <input value={sp.notes[k]} onChange={(e) => setForm({ ...form, scentProfile: { ...sp, notes: { ...sp.notes, [k]: e.target.value } } })} /></div>
            ))}
          </div></div>

          <div className="acard">
            <div className="acard-header" style={{ justifyContent: 'space-between' }}><span>🧱 Biến thể sản phẩm</span>
              <button type="button" className="btn btn-sm" onClick={() => setForm({ ...form, variants: [...form.variants, emptyVariant()] })}>+ Thêm</button>
            </div>
            <div className="acard-body p0">
              <table className="table">
                <thead><tr><th>SKU</th><th>Size</th><th style={{ textAlign: 'right' }}>Giá</th><th style={{ textAlign: 'right' }}>Giá gốc</th><th style={{ textAlign: 'center' }}>Kho</th><th></th></tr></thead>
                <tbody>
                  {form.variants.map((v, i) => (
                    <tr key={i}>
                      <td><input value={v.sku} onChange={(e) => setVariant(i, 'sku', e.target.value)} style={{ width: 110 }} /></td>
                      <td><input value={v.sizeLabel} onChange={(e) => setVariant(i, 'sizeLabel', e.target.value)} style={{ width: 80 }} /></td>
                      <td><input type="number" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} style={{ width: 100 }} /></td>
                      <td><input type="number" value={v.compareAtPrice || 0} onChange={(e) => setVariant(i, 'compareAtPrice', e.target.value)} style={{ width: 100 }} /></td>
                      <td><input type="number" value={v.stockQuantity} onChange={(e) => setVariant(i, 'stockQuantity', e.target.value)} style={{ width: 70 }} /></td>
                      <td><button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="acard"><div className="acard-header">📤 Xuất bản</div><div className="acard-body">
            <label style={{ display: 'block', marginBottom: 10 }}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Hiển thị</label>
            <label style={{ display: 'block', marginBottom: 10 }}><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Nổi bật</label>
            <label style={{ display: 'block', marginBottom: 14 }}><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> Hàng mới</label>
            <button className="btn" style={{ width: '100%' }}>{editing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}</button>
          </div></div>

          <div className="acard"><div className="acard-header">📂 Phân loại</div><div className="acard-body">
            <div className="field"><label>Danh mục *</label>
              <select value={form.category.categoryId} onChange={(e) => setForm({ ...form, category: { categoryId: e.target.value } })} required>
                <option value="">— Chọn —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div></div>

          <div className="acard"><div className="acard-header">🖼️ Hình ảnh sản phẩm</div><div className="acard-body">
            <ImageUploader value={form.images} folder="products" onChange={(images) => setForm({ ...form, images })} />
          </div></div>
        </div>
      </div>
    </form>
  );
}

function flatten(tree, depth = 0, out = []) {
  for (const c of tree) {
    out.push({ ...c, name: `${'— '.repeat(depth)}${c.name}` });
    if (c.children?.length) flatten(c.children, depth + 1, out);
  }
  return out;
}
