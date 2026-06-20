import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { formatVnd, formatDate } from '../utils/format.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data));
  }, []);

  return (
    <div>
      <h1 className="section-title">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <p className="muted">Chưa có đơn hàng nào.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatVnd(o.pricing.totalAmount)}</td>
                <td>{o.orderStatus}</td>
                <td><Link to={`/orders/${o._id}`}>Xem</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
