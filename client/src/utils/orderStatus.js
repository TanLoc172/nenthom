// Order status metadata shared across admin order screens.
export const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', icon: '🕓', css: 'st-pending' },
  confirmed: { label: 'Đã xác nhận', icon: '✅', css: 'st-confirmed' },
  processing: { label: 'Đang xử lý', icon: '📦', css: 'st-processing' },
  shipped: { label: 'Đang giao', icon: '🚚', css: 'st-shipped' },
  delivered: { label: 'Đã giao', icon: '🎉', css: 'st-delivered' },
  cancelled: { label: 'Đã hủy', icon: '✖️', css: 'st-cancelled' },
  // legacy fallbacks
  paid: { label: 'Đã thanh toán', icon: '💳', css: 'st-confirmed' },
  completed: { label: 'Hoàn tất', icon: '🎉', css: 'st-completed' },
};

export const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const statusInfo = (s) => ORDER_STATUS[s] || { label: s, icon: '•', css: 'st-pending' };

export const PAYMENT = {
  paid: { label: 'Đã TT', css: 'pay-paid' },
  unpaid: { label: 'Chưa TT', css: 'pay-unpaid' },
  refunded: { label: 'Hoàn tiền', css: 'pay-refunded' },
};
export const paymentInfo = (s) => PAYMENT[s] || PAYMENT.unpaid;
