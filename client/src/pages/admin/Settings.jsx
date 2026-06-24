import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';
import AddressPicker from '../../components/AddressPicker.jsx';

export default function AdminSettings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/settings').then((r) => setS(r.data)); }, []);
  if (!s) return <p>Đang tải…</p>;

  const save = async (e) => {
    e.preventDefault();
    await api.put('/admin/settings', s);
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <ul className="breadcrumb"><li><Link to="/admin">Dashboard</Link></li><li className="sep">/</li><li className="active">Cài đặt</li></ul>
          <h1>Cài đặt chung</h1>
        </div>
        {saved && <span className="badge-status st-delivered">✓ Đã lưu</span>}
      </div>

      <form onSubmit={save} style={{ maxWidth: 640 }}>
        <div className="acard"><div className="acard-header">🏪 Thông tin website</div><div className="acard-body">
          <div className="field"><label>Tên website</label><input value={s.siteName} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></div>
          <div className="field"><label>Logo</label>
            <ImageUploader value={s.logoUrl ? [s.logoUrl] : []} folder="site" onChange={(urls) => setS({ ...s, logoUrl: urls[urls.length - 1] || '' })} />
          </div>
        </div></div>

        <div className="acard"><div className="acard-header">🚚 Phí vận chuyển</div><div className="acard-body">
          <div className="field">
            <label>Phí ship mặc định (đồng)</label>
            <input type="number" min="0" value={s.defaultShippingFee ?? 30000} onChange={(e) => setS({ ...s, defaultShippingFee: Number(e.target.value) })} style={{ maxWidth: 180 }} />
            <p style={{ fontSize: 12, color: '#9b9289', marginTop: 4 }}>Áp dụng cho tất cả tỉnh thành chưa được cấu hình riêng.</p>
          </div>

          <div className="field">
            <label>Phí ship theo tỉnh thành</label>
            <p style={{ fontSize: 12, color: '#9b9289', marginBottom: 10 }}>Nhập 0 để miễn phí vận chuyển cho tỉnh đó.</p>

            {/* Zone list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {(s.shippingZones || []).map((zone, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px auto', gap: 10, alignItems: 'center', background: '#f9f5f0', border: '1px solid #EDE5D8', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2C2C2C' }}>{zone.province || <span style={{ color: '#9b9289' }}>Chưa chọn tỉnh</span>}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" min="0" value={zone.fee} placeholder="Phí (đ)"
                      onChange={(e) => {
                        const zones = [...(s.shippingZones || [])];
                        zones[i] = { ...zones[i], fee: Number(e.target.value) };
                        setS({ ...s, shippingZones: zones });
                      }}
                      style={{ width: '100%', height: 36, borderRadius: 8, border: '1px solid #EDE5D8', padding: '0 10px', fontSize: 13 }} />
                    <span style={{ fontSize: 12, color: '#9b9289', whiteSpace: 'nowrap' }}>đồng</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" min="0" max="30" value={zone.estimatedDays} placeholder="Ngày"
                      onChange={(e) => {
                        const zones = [...(s.shippingZones || [])];
                        zones[i] = { ...zones[i], estimatedDays: Number(e.target.value) };
                        setS({ ...s, shippingZones: zones });
                      }}
                      style={{ width: '100%', height: 36, borderRadius: 8, border: '1px solid #EDE5D8', padding: '0 10px', fontSize: 13 }} />
                    <span style={{ fontSize: 12, color: '#9b9289', whiteSpace: 'nowrap' }}>ngày</span>
                  </div>
                  <button type="button" onClick={() => setS({ ...s, shippingZones: s.shippingZones.filter((_, j) => j !== i) })}
                    style={{ background: 'none', border: 'none', color: '#c0563f', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>

            {/* Add zone */}
            <ZoneAdder onAdd={(zone) => setS(prev => ({ ...prev, shippingZones: [...(prev.shippingZones || []), zone] }))} existing={s.shippingZones || []} />
          </div>
        </div></div>

        <div className="acard"><div className="acard-header">📞 Liên hệ</div><div className="acard-body">
          <div className="field"><label>Điện thoại</label><input value={s.contact?.phone || ''} onChange={(e) => setS({ ...s, contact: { ...s.contact, phone: e.target.value } })} /></div>
          <div className="field"><label>Email</label><input value={s.contact?.email || ''} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} /></div>
          <div className="field"><label>Địa chỉ</label><input value={s.contact?.address || ''} onChange={(e) => setS({ ...s, contact: { ...s.contact, address: e.target.value } })} /></div>
        </div></div>

        <div className="acard"><div className="acard-header">🔍 SEO</div><div className="acard-body">
          <div className="field"><label>Tiêu đề mặc định</label><input value={s.seo?.defaultTitle || ''} onChange={(e) => setS({ ...s, seo: { ...s.seo, defaultTitle: e.target.value } })} /></div>
          <div className="field"><label>Mô tả mặc định</label><textarea value={s.seo?.defaultDescription || ''} onChange={(e) => setS({ ...s, seo: { ...s.seo, defaultDescription: e.target.value } })} /></div>
        </div></div>

        <button className="btn">Lưu cài đặt</button>
      </form>
    </div>
  );
}

function ZoneAdder({ onAdd, existing }) {
  const [addr, setAddr] = useState({ province: '', provinceCode: '' });
  const [fee, setFee] = useState(0);
  const [days, setDays] = useState(3);

  const add = () => {
    if (!addr.province) return;
    if (existing.some(z => z.province === addr.province)) return;
    onAdd({ province: addr.province, fee, estimatedDays: days });
    setAddr({ province: '', provinceCode: '' });
    setFee(0);
    setDays(3);
  };

  return (
    <div style={{ background: '#fff', border: '1.5px dashed #EDE5D8', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', marginBottom: 10 }}>+ Thêm tỉnh thành</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 10 }}>
        <AddressPicker
          value={addr}
          onChange={(v) => setAddr({ province: v.province || '', provinceCode: v.provinceCode || '' })}
        />
      </div>
      {addr.province && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <label style={{ fontSize: 12, color: '#6b6560' }}>
            Phí (đồng)
            <input type="number" min="0" value={fee} onChange={(e) => setFee(Number(e.target.value))}
              style={{ display: 'block', marginTop: 4, width: '100%', height: 36, borderRadius: 8, border: '1px solid #EDE5D8', padding: '0 10px', fontSize: 13 }} />
          </label>
          <label style={{ fontSize: 12, color: '#6b6560' }}>
            Thời gian giao (ngày)
            <input type="number" min="0" max="30" value={days} onChange={(e) => setDays(Number(e.target.value))}
              style={{ display: 'block', marginTop: 4, width: '100%', height: 36, borderRadius: 8, border: '1px solid #EDE5D8', padding: '0 10px', fontSize: 13 }} />
          </label>
          <button type="button" onClick={add} className="btn btn-sm" style={{ height: 36 }}>Thêm</button>
        </div>
      )}
      {addr.province && existing.some(z => z.province === addr.province) && (
        <p style={{ fontSize: 12, color: '#c0563f', marginTop: 6 }}>Tỉnh này đã có trong danh sách.</p>
      )}
    </div>
  );
}
