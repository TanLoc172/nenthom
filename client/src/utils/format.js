export function formatVnd(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
}

/* ABC-style money: "480.000₫" */
export function money(n) {
  return (n || 0).toLocaleString('vi-VN') + '₫';
}

/* Render 5-star row like ABC <Stars> */
export function starStr(r) {
  const f = Math.round(r || 0);
  return { full: '★'.repeat(f), empty: '★'.repeat(5 - f) };
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
}
