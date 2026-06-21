import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import useSeo from '../utils/useSeo.js';
import { formatDate } from '../utils/format.js';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.get(`/posts/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false));
  }, [slug]);

  useSeo(post ? { title: post.title, description: post.excerpt, image: post.thumbnailUrl, type: 'article' } : {});

  if (post === null) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Đang tải…</p></div>;
  if (post === false) return <div className="container" style={{ padding: '60px 32px' }}><p className="muted">Không tìm thấy bài viết.</p></div>;

  return (
    <div>
      <div className="container" style={{ padding: '28px 32px 0' }}>
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <Link className="tlink" to="/blog">Blog</Link> / <b>{post.title}</b></div>
      </div>
      <article className="container" style={{ maxWidth: 760, padding: '24px 32px 60px' }}>
        <h1 className="serif" style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.12, margin: '14px 0 14px' }}>{post.title}</h1>
        <div style={{ fontSize: 13, color: '#9b9289', marginBottom: 28 }}>Bởi {post.authorName || 'Nến Thơm ABC'} · {formatDate(post.publishedAt)}</div>
        {post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', borderRadius: 18, marginBottom: 32 }} />}
        <div className="blog-content" style={{ fontSize: 16, lineHeight: 1.9, color: '#3f3a32' }} dangerouslySetInnerHTML={{ __html: post.content }} />
        <div style={{ marginTop: 36 }}><Link to="/blog" className="btn btn-outline">← Quay lại Blog</Link></div>
      </article>
    </div>
  );
}
