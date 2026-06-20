import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  if (post === null) return <p>Đang tải…</p>;
  if (post === false) return <p>Không tìm thấy bài viết.</p>;

  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <p className="muted">{post.authorName} — {formatDate(post.publishedAt)}</p>
      {post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', borderRadius: 12, margin: '16px 0' }} />}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
