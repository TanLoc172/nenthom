# Eshop — React + Express (migrated from ASP.NET MVC)

Bản viết lại của website nến thơm từ **ASP.NET Core MVC (.NET 8) + MongoDB** sang:

- **Backend:** Node.js + Express + Mongoose (REST API) — `/server`
- **Frontend:** Vite + React + React Router (SPA) — `/client`
- **Database:** dùng lại đúng MongoDB cũ (tên collection và field giữ nguyên, không cần migrate dữ liệu)

---

## Chạy dự án

```bash
# 1. Backend
cd server
cp .env.example .env          # điền MONGODB_URI từ app .NET cũ (appsettings.json)
npm install
npm run seed                   # seed dữ liệu mẫu đầy đủ (admin + sản phẩm + ...)
npm run dev                    # http://localhost:5000

# 2. Frontend (terminal khác)
cd client
npm install
npm run dev                    # http://localhost:5173
```

Vite proxy `/api` và `/uploads` sang `http://localhost:5000`, nên không cần cấu hình CORS khi dev.

> Lưu ý: lấy `MONGODB_URI` thật trong `Eshop/appsettings.json` (mục `MongoDbSettings.ConnectionString`).
> **Không commit** chuỗi kết nối/API key — đã có `.gitignore` cho `.env`.

---

## Khác biệt kiến trúc chính

| ASP.NET MVC | React + Express |
|---|---|
| Cookie auth (`CookieAuthenticationDefaults`) | JWT trong httpOnly cookie (`token`) |
| Razor views (`.cshtml`) render server-side | React components render client-side |
| `MongoDbService.GetCollection<T>` | Mongoose models (cùng tên collection) |
| Service + Interface (DI) | Controllers gọi thẳng Mongoose model |
| `BCrypt.Net-Next` | `bcryptjs` |
| EPPlus (export Excel) | `exceljs` (đã thêm dependency, chưa nối route) |
| `PageViewMiddleware` | (chưa port — xem phần còn lại) |

---

## Mapping Controller (.NET) → API + Page (React)

| Tính năng | API mới (Express) | Trang React |
|---|---|---|
| HomeController | `GET /api/products/featured`, `/banners`, `/flash-sale` | `pages/Home.jsx` |
| ProductController | `GET /api/products`, `/api/products/:slug` | `ProductList.jsx`, `ProductDetail.jsx` |
| CategoryController | `GET /api/categories`, `/api/categories/:slug` | `CategoryPage.jsx` |
| CartController | `GET/POST/PUT/DELETE /api/cart...` | `Cart.jsx` |
| CheckoutController | `POST /api/checkout` | `Checkout.jsx`, `OrderConfirmation.jsx` |
| AccountController | `POST /api/auth/*`, `GET/PUT /api/account/*` | `Login.jsx`, `Register.jsx`, `Account.jsx` |
| OrderController (user) | `GET /api/orders`, `/api/orders/:id` | `Orders.jsx`, `OrderDetail.jsx` |
| WishlistController | `GET/POST/DELETE /api/wishlist` | `Wishlist.jsx` |
| ReviewController | `GET/POST /api/products/:id/reviews` | trong `ProductDetail.jsx` |
| BlogController | `GET /api/posts`, `/api/posts/:slug` | `Blog.jsx`, `BlogDetail.jsx` |
| PaymentController (VietQR) | `GET /api/payment/vietqr/:orderId`, `POST /api/payment/casso/webhook` | trong `OrderConfirmation.jsx` |
| NewsletterController | `POST /api/newsletter/subscribe` | (gắn vào footer khi cần) |
| Admin/DashboardController | `GET /api/admin/dashboard` | `admin/Dashboard.jsx` |
| Admin/ProductController | `GET/POST/PUT/DELETE /api/admin/products` | `admin/Products.jsx` |
| Admin/OrderController | `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status` | `admin/Orders.jsx` |
| Admin/CouponController | `/api/admin/coupons` | (API xong, chưa có UI) |
| Admin/Category/Banner/Post/FlashSale/Review/User/Setting | `/api/admin/*` | (API xong, chưa có UI) |

---

## Trạng thái: ĐÃ XONG vs CÒN LẠI

### ✅ Đã hoàn thành (toàn bộ chức năng cốt lõi)
- Toàn bộ **20+ model** → Mongoose (giữ tên collection + field camelCase, đọc thẳng DB cũ)
- **Auth** đầy đủ: đăng ký/đăng nhập/đăng xuất/quên-đặt lại mật khẩu, JWT cookie, phân quyền `requireAuth`/`requireAdmin`
- **OAuth** Google + Facebook (luồng code thủ công, tự bật khi có env; nút social tự ẩn nếu chưa cấu hình)
- **Storefront API**: products (filter/search/sort/paginate), categories (+cây), cart (user + guest), checkout (coupon, phí ship theo zone, trừ kho, điểm thưởng), orders, reviews, wishlist, blog, banner, flash sale, newsletter, settings, **contact**
- **Payment**: sinh VietQR + webhook đối soát Casso
- **Email**: `nodemailer` (reset mật khẩu, xác nhận đơn, form liên hệ) — fallback log console khi chưa cấu hình SMTP
- **Upload ảnh**: route `multer` lưu `server/uploads`, component `ImageUploader` ở mọi form admin
- **PageView tracking**: middleware Express ghi `PageViews` (bỏ qua bot/static/admin)
- **Admin API + UI đầy đủ**: dashboard, products (form variants/scent/ảnh), categories (cây), inventory (sửa tồn nhanh), orders, coupons, flash-sales, banners, posts, reviews, users, **reports (biểu đồ + top SP)**, **audit log**, settings, **export Excel** (orders/products)
- **Frontend SPA**: ~30 trang storefront + 16 trang admin, routing có bảo vệ, footer (newsletter + link), quiz mùi hương, trang tĩnh (FAQ/Shipping/Return/Warranty)

### ✅ Đã bổ sung (đợt hoàn thiện)
- **Seed đầy đủ**: `npm run seed` tạo admin + 5 khách + 10 danh mục + 10 sản phẩm + coupon + review + flash sale + 3 bài blog + SiteSetting (port từ `Seeder.cs`). Idempotent — chỉ seed collection nào trống. Xoá & seed lại: `SEED_RESET=true npm run seed`. Đổi creds admin qua `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- **AuditLog tự động**: middleware ghi mọi thao tác POST/PUT/DELETE trong admin vào `AuditLogs` (ẩn field nhạy cảm)
- **Rich text editor** cho blog (`RichText`, không cần thư viện ngoài)
- **SEO meta tags**: hook `useSeo` đặt title + description + Open Graph cho Home, sản phẩm, danh mục, blog
- **Trang Relax**: bài tập hít thở cùng ánh nến

### ⏳ Chỉ còn (tùy chọn, cần đánh giá riêng)
- **SSR thực thụ** cho SEO tối đa: SPA + `useSeo` đã đặt được title/meta (Google render JS nên vẫn index tốt), nhưng nếu cần điểm SEO cao nhất / share link social chuẩn thì chuyển sang SSR (vite-plugin-ssr) hoặc Next.js — đây là thay đổi kiến trúc lớn, làm riêng khi cần.

---

## Cấu trúc thư mục

```
eshop-react/
├── server/
│   └── src/
│       ├── index.js              # entry, middleware pipeline
│       ├── config/db.js
│       ├── middleware/           # auth.js, error.js
│       ├── models/               # *.js (Mongoose) + misc.js
│       ├── controllers/          # *Controller.js
│       ├── routes/index.js       # toàn bộ route (public + /admin)
│       └── utils/                # slug.js, token.js
└── client/
    └── src/
        ├── main.jsx, App.jsx, styles.css
        ├── api/client.js         # axios instance
        ├── context/              # AuthContext, CartContext
        ├── components/           # Layout, AdminLayout, ProtectedRoute, ProductCard
        └── pages/                # storefront + admin/
```
