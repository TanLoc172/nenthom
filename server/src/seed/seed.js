import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import Post from '../models/Post.js';
import FlashSale from '../models/FlashSale.js';
import SiteSetting from '../models/SiteSetting.js';
import { CATEGORIES, PRODUCT_DEFS, buildProduct, COUPONS, CUSTOMERS, REVIEW_TEXTS, POSTS } from './data.js';

// Full sample seed (ported from ASP.NET Seeder.cs).
// Idempotent: each section only runs when its collection is empty.
// Usage: npm run seed   |   wipe + reseed: SEED_RESET=true npm run seed
async function run() {
  await connectDB();

  if (process.env.SEED_RESET === 'true') {
    console.log('[seed] SEED_RESET=true → xoá dữ liệu mẫu cũ…');
    await Promise.all([
      User.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL || 'admin@eshop.local' } }),
      Category.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({}),
      Review.deleteMany({}), FlashSale.deleteMany({}),
    ]);
  }

  // 1) Admin + customers
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eshop.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10),
      roles: ['admin', 'customer'], isVerified: true, profile: { firstName: 'Admin' },
    });
    console.log(`[seed] Admin: ${adminEmail} / ${adminPassword}`);
  } else if (!admin.roles.includes('admin')) {
    admin.roles.push('admin'); await admin.save();
  }

  let customers = await User.find({ roles: ['customer'] }).limit(5);
  if (customers.length === 0) {
    const pw = await bcrypt.hash('Customer@123', 10);
    customers = await User.insertMany(
      CUSTOMERS.map(([email, firstName, lastName, phone]) => ({
        email, passwordHash: pw, phone, roles: ['customer'], isVerified: true,
        profile: { firstName, lastName },
      }))
    );
    console.log(`[seed] ${customers.length} customers (mật khẩu: Customer@123)`);
  }

  // 2) Categories
  let categories = await Category.find();
  if (categories.length === 0) {
    categories = await Category.insertMany(CATEGORIES);
    console.log(`[seed] ${categories.length} categories`);
  }
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // 3) Products
  let products = await Product.find();
  if (products.length === 0) {
    products = await Product.insertMany(
      PRODUCT_DEFS.map((def) => buildProduct(def, catBySlug[def[2]])).filter((p) => p.category.categoryId)
    );
    console.log(`[seed] ${products.length} products`);
  }

  // 4) Coupons
  if ((await Coupon.countDocuments()) === 0) {
    await Coupon.insertMany(COUPONS);
    console.log(`[seed] ${COUPONS.length} coupons`);
  }

  // 5) Reviews
  if ((await Review.countDocuments()) === 0 && products.length && customers.length) {
    const reviews = REVIEW_TEXTS.map(([rating, title, comment], i) => ({
      userId: customers[i % customers.length]._id,
      productId: products[i % products.length]._id,
      rating, title, comment, isVerifiedPurchase: true, status: 'approved',
    }));
    await Review.insertMany(reviews);
    console.log(`[seed] ${reviews.length} reviews`);
  }

  // 6) Blog posts (skip existing slugs)
  const existingSlugs = new Set((await Post.find({}, 'slug')).map((p) => p.slug));
  const newPosts = POSTS.filter((p) => !existingSlugs.has(p.slug)).map((p) => ({ ...p, publishedAt: new Date() }));
  if (newPosts.length) {
    await Post.insertMany(newPosts);
    console.log(`[seed] ${newPosts.length} blog posts`);
  }

  // 7) Flash sale (đang diễn ra)
  if ((await FlashSale.countDocuments()) === 0 && products.length >= 4) {
    const items = products.slice(0, 6).map((p) => {
      const v = p.variants[0];
      const orig = v?.price || 199000;
      const sale = Math.round((orig * 0.75) / 1000) * 1000;
      return {
        productId: p._id, productName: p.name, slug: p.slug,
        imageUrl: p.images?.[0] || v?.images?.[0],
        originalPrice: orig, salePrice: sale, saleQuantity: 50,
        soldCount: 12 + Math.floor(Math.random() * 30),
      };
    });
    await FlashSale.create({
      name: 'Flash Sale Cuối Tuần',
      description: 'Ưu đãi có hạn — giảm đến 25% các mùi hương bán chạy nhất.',
      startTime: new Date(Date.now() - 3600000), endTime: new Date(Date.now() + 3 * 86400000),
      isActive: true, items,
    });
    console.log('[seed] 1 flash sale');
  }

  // 8) Site settings
  if (!(await SiteSetting.findById('global'))) {
    await SiteSetting.create({ _id: 'global' });
    console.log('[seed] global SiteSetting');
  }

  await mongoose.connection.close();
  console.log('[seed] Done ✅');
}

run().catch((err) => { console.error('[seed] Failed:', err); process.exit(1); });
