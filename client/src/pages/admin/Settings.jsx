import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ImageUploader from '../../components/ImageUploader.jsx';

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
          <div className="field"><label>Phí ship mặc định</label><input type="number" value={s.defaultShippingFee} onChange={(e) => setS({ ...s, defaultShippingFee: Number(e.target.value) })} /></div>
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
