import { Link, NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link to="/" className="logo">← Về trang chủ</Link>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Sản phẩm</NavLink>
          <NavLink to="/admin/categories">Danh mục</NavLink>
          <NavLink to="/admin/inventory">Tồn kho</NavLink>
          <NavLink to="/admin/orders">Đơn hàng</NavLink>
          <NavLink to="/admin/coupons">Mã giảm giá</NavLink>
          <NavLink to="/admin/flash-sales">Flash Sale</NavLink>
          <NavLink to="/admin/bundles">Mua kèm</NavLink>
          <NavLink to="/admin/banners">Banner</NavLink>
          <NavLink to="/admin/posts">Blog</NavLink>
          <NavLink to="/admin/reviews">Đánh giá</NavLink>
          <NavLink to="/admin/users">Người dùng</NavLink>
          <NavLink to="/admin/reports">Báo cáo</NavLink>
          <NavLink to="/admin/audit-log">Nhật ký</NavLink>
          <NavLink to="/admin/settings">Cài đặt</NavLink>
        </nav>
      </aside>
      <div className="admin-content container">
        <Outlet />
      </div>
    </div>
  );
}
