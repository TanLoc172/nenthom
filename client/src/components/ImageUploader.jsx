import { useState } from 'react';
import api from '../api/client.js';

// Multi-image uploader. value = array of url strings; onChange(urls).
export default function ImageUploader({ value = [], onChange, folder = 'misc' }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setErr('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const r = await api.post(`/admin/upload/${folder}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...value, ...r.data.urls]);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const remove = (url) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {value.map((url) => (
          <div key={url} style={{ position: 'relative' }}>
            <img src={url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
            <button type="button" onClick={() => remove(url)}
              style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={busy} />
      {busy && <span className="muted"> Đang tải lên…</span>}
      {err && <p className="error">{err}</p>}
    </div>
  );
}
