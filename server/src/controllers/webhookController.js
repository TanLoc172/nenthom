import { Webhook } from 'svix';
import User from '../models/User.js';

// POST /api/webhooks/clerk
// Clerk gửi sự kiện user.created / user.updated để đồng bộ MongoDB
export async function clerkWebhook(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ message: 'CLERK_WEBHOOK_SECRET chưa được cấu hình' });

  const wh = new Webhook(secret);
  let evt;
  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id':        req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const { type, data } = evt;

  if (type === 'user.created') {
    const email = data.email_addresses?.[0]?.email_address || '';
    // Tìm user cũ theo email (đã đăng ký trước khi dùng Clerk) hoặc tạo mới
    let user = await User.findOne({ email });
    if (user) {
      user.clerkId = data.id;
      user.isVerified = true;
    } else {
      user = new User({
        clerkId: data.id,
        email,
        isVerified: true,
        roles: ['customer'],
        profile: {
          firstName: data.first_name || '',
          lastName:  data.last_name  || '',
          avatarUrl: data.image_url  || '',
        },
      });
    }
    await user.save();
  }

  if (type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address || '';
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        $set: {
          email,
          'profile.firstName': data.first_name || '',
          'profile.lastName':  data.last_name  || '',
          'profile.avatarUrl': data.image_url  || '',
        },
      }
    );
  }

  if (type === 'user.deleted') {
    await User.findOneAndUpdate({ clerkId: data.id }, { $set: { status: 'deleted' } });
  }

  res.json({ received: true });
}
