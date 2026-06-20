import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { formatDate } from '../utils/format.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/posts').then((r) => setPosts(r.data.items));
  }, []);

  return (
    <div>
      <h1 className="section-title">Blog</h1>
      <div className="grid">
        {posts.map((p) => (
          <Link key={p._id} to={`/blog/${p.slug}`} className="product-card">
            <div className="product-card-img">{p.thumbnailUrl && <img src={p.thumbnailUrl} alt={p.title} />}</div>
            <div className="product-card-body">
              <h3>{p.title}</h3>
              <p className="muted" style={{ fontSize: 13 }}>{formatDate(p.publishedAt)}</p>
              <p style={{ fontSize: 14 }}>{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
