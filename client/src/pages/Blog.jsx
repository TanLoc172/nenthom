import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { formatDate } from '../utils/format.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/posts').then((r) => setPosts(r.data.items));
  }, []);

  const feat = posts[0];
  const rest = posts.slice(1);

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Blog</b></div>
        <h1 className="serif">Blog & Cảm hứng</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0', maxWidth: 560 }}>Mẹo thư giãn, hướng dẫn sử dụng và câu chuyện đằng sau những hương thơm của chúng tôi.</p>
      </div></div>

      <div className="container" style={{ padding: '48px 32px 90px' }}>
        {feat && (
          <Link to={`/blog/${feat.slug}`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'center', background: 'var(--soft)', borderRadius: 20, overflow: 'hidden', marginBottom: 48, border: '1px solid #F0E9DD' }} className="blog-feature">
            <div style={{ height: 320, background: feat.thumbnailUrl ? `url(${feat.thumbnailUrl}) center/cover` : 'linear-gradient(135deg,#dcc09a,#6f5436)' }} />
            <div style={{ padding: '32px 36px 32px 0' }}>
              <div style={{ fontSize: 12, color: '#9b9289', marginBottom: 12 }}>{formatDate(feat.publishedAt)}</div>
              <h2 className="serif" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15, marginBottom: 14 }}>{feat.title}</h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px' }}>{feat.excerpt}</p>
              <span className="under">Đọc bài viết →</span>
            </div>
          </Link>
        )}

        <div className="grid3">
          {rest.map((p) => (
            <Link key={p._id} to={`/blog/${p.slug}`} style={{ display: 'block' }}>
              <div style={{ height: 200, borderRadius: 16, background: p.thumbnailUrl ? `url(${p.thumbnailUrl}) center/cover` : 'linear-gradient(135deg,#f4e7cb,#c9a86f)', marginBottom: 16 }} />
              <div style={{ fontSize: 12, color: '#9b9289', marginBottom: 8 }}>{formatDate(p.publishedAt)}</div>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2, marginBottom: 8, color: 'var(--ink)' }}>{p.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
