import asyncHandler from 'express-async-handler';
import { sendContactEmail } from '../utils/email.js';

// POST /api/contact  { fullName, email, subject, message }
export const submitContact = asyncHandler(async (req, res) => {
  const { fullName, email, subject, message } = req.body;
  if (!fullName || !email || !message)
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  await sendContactEmail({ fromName: fullName, fromEmail: email, subject: subject || '(Không tiêu đề)', message });
  res.json({ message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.' });
});
