import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatVnd } from '../utils/format.js';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items.length)
    return (
      <div>
        <h1 className="section-title">Giỏ hàng</h1>
        <p className="muted">Giỏ hàng trống. <Link to="/products">Mua sắm ngay</Link></p>
      </div>
    );

  return (
    <div>
      <h1 className="section-title">Giỏ hàng</h1>
      <table className="table">
        <thead>
          <tr><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Tổng</th><th></th></tr>
        </thead>
        <tbody>
          {cart.items.map((it) => (
            <tr key={it.productId + it.variantSku}>
              <td>
                <Link to={`/products/${it.slug}`}>{it.name}</Link>
                <div className="muted" style={{ fontSize: 13 }}>{it.sizeLabel}</div>
              </td>
              <td>{formatVnd(it.price)}</td>
              <td>
                <input
                  type="number" min="1" value={it.quantity} style={{ width: 70 }}
                  onChange={(e) => updateItem(it.productId, it.variantSku, Number(e.target.value))}
                />
              </td>
              <td>{formatVnd(it.lineTotal)}</td>
              <td><button className="btn-outline btn" onClick={() => removeItem(it.productId, it.variantSku)}>Xoá</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: 20 }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>Tạm tính: <strong>{formatVnd(cart.subtotal)}</strong></div>
        <button className="btn" onClick={() => navigate('/checkout')}>Tiến hành thanh toán</button>
      </div>
    </div>
  );
}
