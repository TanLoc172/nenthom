import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '110px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>🕯️</div>
      <h1 className="serif" style={{ fontSize: 72, fontWeight: 600, color: 'var(--wood)', lineHeight: 1 }}>404</h1>
      <div className="serif" style={{ fontSize: 28, fontWeight: 600, margin: '10px 0 8px' }}>Không tìm thấy trang</div>
      <p className="muted" style={{ fontSize: 14, margin: '0 0 26px' }}>Trang bạn tìm có thể đã bị di chuyển hoặc không tồn tại.</p>
      <Link to="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
    </div>
  );
}
