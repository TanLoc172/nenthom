import nodemailer from 'nodemailer';

// If SMTP_* env vars are set, send real email; otherwise log to console (dev).
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

async function send({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[email:dev] to=${to} | ${subject}\n${text || html}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@eshop.local',
    to,
    subject,
    text,
    html,
  });
}

export function sendPasswordReset(to, name, resetLink) {
  return send({
    to,
    subject: 'Đặt lại mật khẩu',
    text: `Xin chào ${name || ''},\nNhấn vào liên kết để đặt lại mật khẩu: ${resetLink}`,
    html: `<p>Xin chào ${name || ''},</p><p>Nhấn vào liên kết để đặt lại mật khẩu:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}

export function sendOrderConfirmation(to, orderNumber, total) {
  return send({
    to,
    subject: `Xác nhận đơn hàng ${orderNumber}`,
    text: `Cảm ơn bạn đã đặt hàng. Mã đơn: ${orderNumber}. Tổng tiền: ${total.toLocaleString('vi-VN')}đ`,
  });
}

export function sendContactEmail({ fromName, fromEmail, subject, message }) {
  return send({
    to: process.env.CONTACT_TO || process.env.SMTP_FROM || 'admin@eshop.local',
    subject: `[Liên hệ] ${subject}`,
    text: `Từ: ${fromName} <${fromEmail}>\n\n${message}`,
  });
}
