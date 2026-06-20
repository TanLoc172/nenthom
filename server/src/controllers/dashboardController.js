import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { PageView } from '../models/misc.js';

const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

// GET /api/admin/dashboard
export const dashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 86400000);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [allOrders, totalCustomers, totalProducts, pendingOrders, pendingReviews, lowStock, visitorsToday] =
    await Promise.all([
      Order.find({}, 'pricing items orderStatus createdAt'),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Review.countDocuments({ status: 'pending' }),
      Product.countDocuments({ 'variants.stockQuantity': { $lte: 5 } }),
      PageView.countDocuments({ createdAt: { $gte: startToday } }),
    ]);

  const inRange = (o, a, b) => o.createdAt >= a && (!b || o.createdAt < b);
  const todayOrders = allOrders.filter((o) => inRange(o, startToday));
  const yesterdayOrders = allOrders.filter((o) => inRange(o, startYesterday, startToday));
  const monthOrders = allOrders.filter((o) => inRange(o, startMonth));
  const lastMonthOrders = allOrders.filter((o) => inRange(o, startLastMonth, startMonth));
  const rev = (o) => o.pricing?.totalAmount || 0;

  // last 7 days revenue
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startToday.getTime() - i * 86400000);
    const next = new Date(d.getTime() + 86400000);
    const dayOrders = allOrders.filter((o) => inRange(o, d, next));
    daily.push({ date: d.toISOString().slice(0, 10), revenue: sum(dayOrders, rev), orders: dayOrders.length });
  }

  // best sellers
  const sales = {};
  for (const o of allOrders) {
    for (const it of o.items || []) {
      const key = it.productName;
      sales[key] = (sales[key] || 0) + it.quantity;
    }
  }
  const bestSellers = Object.entries(sales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  res.json({
    summary: {
      todayRevenue: sum(todayOrders, rev),
      yesterdayRevenue: sum(yesterdayOrders, rev),
      todayOrders: todayOrders.length,
      monthRevenue: sum(monthOrders, rev),
      lastMonthRevenue: sum(lastMonthOrders, rev),
      totalRevenueAllTime: sum(allOrders, rev),
      totalOrders: allOrders.length,
      totalCustomers,
      totalProducts,
      pendingOrders,
      pendingReviews,
      lowStock,
      visitorsToday,
    },
    dailyRevenue: daily,
    bestSellers,
    recentOrders: [...allOrders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8),
  });
});
