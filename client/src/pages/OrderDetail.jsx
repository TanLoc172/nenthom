import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { formatVnd, formatDate } from '../utils/format.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data));
  }, [id]);

  if (!order) return <p>Đang tải…</p>;

  return (
    <div>
      <h1 className="section-title">Đơn {order.orderNumber}</h1>
      <p className="muted">Ngày đặt: {formatDate(order.createdAt)} — Trạng thái: {order.orderStatus}</p>

      <table className="table">
        <thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th></tr></thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={i}>
              <td>{it.productName} <span className="muted">{it.sizeLabel}</span></td>
              <td>{it.quantity}</td>
              <td>{formatVnd(it.price)}</td>
              <td>{formatVnd(it.price * it.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ marginTop: 20, maxWidth: 360, marginLeft: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><span>Tạm tính</span><span>{formatVnd(order.pricing.subtotal)}</span></div>
        <div className="row" style={{ justifyContent: 'space-between' }}><span>Giảm giá</span><span>-{formatVnd(order.pricing.discountAmount)}</span></div>
        <div className="row" style={{ justifyContent: 'space-between' }}><span>Phí ship</span><span>{formatVnd(order.pricing.shippingFee)}</span></div>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 18 }}><strong>Tổng</strong><strong>{formatVnd(order.pricing.totalAmount)}</strong></div>
      </div>
    </div>
  );
}
