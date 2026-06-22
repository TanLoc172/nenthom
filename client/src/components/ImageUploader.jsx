import { useState, useRef } from 'react';
import api from '../api/client.js';

// Multi-image uploader.
// value = string[]  (array of URLs)
// onChange(urls)
// Supports two input modes: paste URL  |  upload file
export default function ImageUploader({ value = [], onChange, folder = 'misc' }) {
  const [tab, setTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  // ---- URL mode ----
  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!value.includes(url)) onChange([...value, url]);
    setUrlInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addUrl(); }
  };

  // ---- File mode ----
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
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = (url) => onChange(value.filter((u) => u !== url));

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      style={{
        padding: '5px 14px', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
        border: '1.5px solid',
        borderColor: tab === id ? 'var(--primary)' : 'var(--border)',
        background: tab === id ? 'var(--primary)' : '#fff',
        color: tab === id ? '#fff' : 'var(--fg-soft)',
        transition: 'all .18s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Previews */}
      {value.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {value.map((url) => (
            <div key={url} style={{ position: 'relative' }}>
              <img
                src={url} alt=""
                style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
                onError={(e) => { e.target.style.background = '#f5f5f5'; }}
              />
              <button
                type="button" onClick={() => remove(url)}
                style={{ position: 'absolute', top: -7, right: -7, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, lineHeight: '20px', cursor: 'pointer', fontSize: 13, padding: 0 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {tabBtn('url', '🔗 Nhập URL')}
        {tabBtn('file', '📁 Upload file')}
      </div>

      {/* URL input */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="url"
            placeholder="Dán URL ảnh vào đây…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: '8px 12px', fontSize: 14, borderRadius: 7, border: '1.5px solid var(--border)', fontFamily: 'inherit' }}
          />
          <button
            type="button" onClick={addUrl}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 7, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Thêm
          </button>
        </div>
      )}

      {/* File upload */}
      {tab === 'file' && (
        <div>
          <input
            ref={fileRef}
            type="file" accept="image/*" multiple
            onChange={handleFiles}
            disabled={busy}
            style={{ fontSize: 14 }}
          />
          {busy && <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>Đang tải lên…</span>}
        </div>
      )}

      {err && <p className="error" style={{ marginTop: 6, fontSize: 13 }}>{err}</p>}
    </div>
  );
}
