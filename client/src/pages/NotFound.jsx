import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <h1>404</h1>
      <p className="muted">Không tìm thấy trang.</p>
      <Link to="/" className="btn">Về trang chủ</Link>
    </div>
  );
}
