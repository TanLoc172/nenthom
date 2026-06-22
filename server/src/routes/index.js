import { Router } from 'express';
import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { auditLogger } from '../middleware/audit.js';

import * as auth from '../controllers/authController.js';
import * as oauth from '../controllers/oauthController.js';
import * as product from '../controllers/productController.js';
import * as category from '../controllers/categoryController.js';
import * as cart from '../controllers/cartController.js';
import * as order from '../controllers/orderController.js';
import * as coupon from '../controllers/couponController.js';
import * as review from '../controllers/reviewController.js';
import * as wishlist from '../controllers/wishlistController.js';
import * as content from '../controllers/contentController.js';
import * as dash from '../controllers/dashboardController.js';
import * as user from '../controllers/userController.js';
import * as payment from '../controllers/paymentController.js';
import * as contact from '../controllers/contactController.js';
import * as adminx from '../controllers/adminController.js';
import * as exp from '../controllers/exportController.js';
import * as uploadCtrl from '../controllers/uploadController.js';
import * as homeCtrl from '../controllers/homeController.js';
import { clerkWebhook } from '../controllers/webhookController.js';

const r = Router();

// ---------- Home aggregate ----------
r.get('/home', homeCtrl.home);

// ---------- Clerk webhook (raw body needed) ----------
r.post('/webhooks/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

// ---------- Auth (legacy — kept for /auth/me) ----------
r.get('/auth/me', auth.me);
r.post('/auth/forgot-password', auth.forgotPassword);
r.post('/auth/reset-password', auth.resetPassword);
// Social login
r.get('/auth/providers', oauth.providers);
r.get('/auth/google', oauth.googleStart);
r.get('/auth/google/callback', oauth.googleCallback);
r.get('/auth/facebook', oauth.facebookStart);
r.get('/auth/facebook/callback', oauth.facebookCallback);

// ---------- Products (public) ----------
r.get('/products', product.listProducts);
r.get('/products/featured', product.featuredProducts);
r.get('/products/:slug', product.getProductBySlug);
r.get('/products/:productId/reviews', review.productReviews);
r.post('/products/:productId/reviews', requireAuth, review.createReview);

// ---------- Categories ----------
r.get('/categories', category.listCategories);
r.get('/categories/tree', category.categoryTree);
r.get('/categories/:slug', category.getCategoryBySlug);

// ---------- Cart ----------
r.get('/cart', cart.getCart);
r.get('/cart/count', cart.cartCount);
r.post('/cart/items', cart.addItem);
r.put('/cart/items', cart.updateItem);
r.delete('/cart/items', cart.removeItem);
r.delete('/cart', cart.clearCart);

// ---------- Coupons ----------
r.post('/coupons/validate', coupon.validateCoupon);

// ---------- Checkout / Orders ----------
r.post('/checkout', order.checkout); // checkout reads cart internally
r.get('/orders', requireAuth, order.myOrders);
r.get('/orders/:id', order.getOrder);

// ---------- Wishlist (auth) ----------
r.get('/wishlist', requireAuth, wishlist.getWishlist);
r.post('/wishlist/:productId', requireAuth, wishlist.addToWishlist);
r.delete('/wishlist/:productId', requireAuth, wishlist.removeFromWishlist);

// ---------- Account (auth) ----------
r.get('/account/profile', requireAuth, user.getProfile);
r.put('/account/profile', requireAuth, user.updateProfile);
r.put('/account/password', requireAuth, user.changePassword);
r.get('/account/addresses', requireAuth, user.getAddresses);
r.post('/account/addresses', requireAuth, user.addAddress);
r.put('/account/addresses/:addressId', requireAuth, user.updateAddress);
r.delete('/account/addresses/:addressId', requireAuth, user.deleteAddress);

// ---------- Content (public) ----------
r.get('/banners', content.activeBanners);
r.get('/posts', content.listPosts);
r.get('/posts/:slug', content.getPostBySlug);
r.get('/flash-sale', content.activeFlashSale);
r.get('/settings', content.getSettings);
r.post('/newsletter/subscribe', content.subscribeNewsletter);
r.post('/contact', contact.submitContact);

// ---------- Payment ----------
r.get('/payment/vietqr/:orderId', payment.getVietQr);
r.post('/payment/casso/webhook', payment.cassoWebhook);

// ========== ADMIN ==========
const admin = Router();
admin.use(requireAuth, requireAdmin, auditLogger);

admin.get('/dashboard', dash.dashboard);

admin.get('/products', product.adminListProducts);
admin.post('/products', product.createProduct);
admin.get('/products/:id', product.adminGetProduct);
admin.put('/products/:id', product.updateProduct);
admin.delete('/products/:id', product.deleteProduct);

admin.post('/categories', category.createCategory);
admin.put('/categories/:id', category.updateCategory);
admin.delete('/categories/:id', category.deleteCategory);

admin.get('/orders', order.adminListOrders);
admin.put('/orders/:id/status', order.updateOrderStatus);

admin.get('/coupons', coupon.listCoupons);
admin.post('/coupons', coupon.createCoupon);
admin.put('/coupons/:id', coupon.updateCoupon);
admin.delete('/coupons/:id', coupon.deleteCoupon);

admin.get('/reviews', review.adminListReviews);
admin.put('/reviews/:id', review.moderateReview);
admin.delete('/reviews/:id', review.deleteReview);

admin.get('/banners', content.adminListBanners);
admin.post('/banners', content.createBanner);
admin.put('/banners/:id', content.updateBanner);
admin.delete('/banners/:id', content.deleteBanner);

admin.get('/posts', content.adminListPosts);
admin.post('/posts', content.createPost);
admin.put('/posts/:id', content.updatePost);
admin.delete('/posts/:id', content.deletePost);

admin.get('/flash-sales', content.adminListFlashSales);
admin.post('/flash-sales', content.createFlashSale);
admin.put('/flash-sales/:id', content.updateFlashSale);
admin.delete('/flash-sales/:id', content.deleteFlashSale);

admin.put('/settings', content.updateSettings);

admin.get('/users', user.adminListUsers);
admin.get('/users/:id', user.adminGetUser);
admin.put('/users/:id', user.adminUpdateUser);

// Inventory
admin.get('/inventory', adminx.inventory);
admin.put('/inventory/stock', adminx.updateStock);

// Report & audit
admin.get('/report', adminx.report);
admin.get('/audit-logs', adminx.auditLogs);

// Excel export
admin.get('/export/orders', exp.exportOrders);
admin.get('/export/products', exp.exportProducts);

// Image upload
admin.post('/upload/:folder', upload.array('files', 10), uploadCtrl.uploadImages);
admin.delete('/upload', uploadCtrl.deleteImage);

r.use('/admin', admin);

export default r;
