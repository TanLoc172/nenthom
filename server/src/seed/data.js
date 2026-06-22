// Sample seed data ported from the old ASP.NET Seeder.cs

export const CATEGORIES = [
  { name: 'Hương Gỗ (Woody)', slug: 'huong-go', description: 'Mang lại cảm giác ấm áp, thư giãn và tĩnh lặng.', isActive: true },
  { name: 'Hương Hoa (Floral)', slug: 'huong-hoa', description: 'Tươi mới, ngọt ngào và tràn đầy sức sống.', isActive: true },
  { name: 'Hương Biển (Aquatic)', slug: 'huong-bien', description: 'Mát mẻ, sảng khoái như mang cả đại dương vào phòng.', isActive: true },
  { name: 'Hương Trái Cây (Fruity)', slug: 'huong-trai-cay', description: 'Ngọt ngào, thanh mát từ những loại quả nhiệt đới.', isActive: true },
  { name: 'Hương Thảo Mộc (Herbal)', slug: 'huong-thao-moc', description: 'Thanh lọc không khí, giảm căng thẳng mệt mỏi.', isActive: true },
  { name: 'Hương Bánh Ngọt (Gourmand)', slug: 'huong-banh-ngot', description: 'Ấm áp, béo ngậy như một tiệm bánh vừa ra lò.', isActive: true },
  { name: 'Khử Mùi (Odor Eliminator)', slug: 'khu-mui', description: 'Đặc chế để đánh bay mùi hôi, ẩm mốc, mùi thú cưng.', isActive: true },
  { name: 'Bộ Quà Tặng (Gift Sets)', slug: 'bo-qua-tang', description: 'Lựa chọn tuyệt vời cho các dịp lễ, kỷ niệm.', isActive: true },
  { name: 'Phụ Kiện Nến', slug: 'phu-kien-nen', description: 'Kéo cắt bấc, diêm dài, chuông dập nến.', isActive: true },
  { name: 'Phiên Bản Lễ Hội', slug: 'phien-ban-le-hoi', description: 'Mùi hương đặc biệt dành riêng cho Giáng sinh, Năm mới.', isActive: true },
];

// [name, slug, categorySlug, shortDesc, top[], middle[], base[]]
export const PRODUCT_DEFS = [
  ['Đà Lạt Sương Mù', 'da-lat-suong-mu', 'huong-go', 'Hương thông rừng', ['Bạc hà', 'Sương sớm'], ['Lá thông', 'Khuynh diệp'], ['Gỗ tuyết tùng']],
  ['Trà Chiều Hoàng Gia', 'tra-chieu-hoang-gia', 'huong-hoa', 'Hương trà Earl Grey', ['Cam Bergamot'], ['Trà đen', 'Hoa nhài'], ['Vanilla', 'Xạ hương']],
  ['Gió Biển Maldives', 'gio-bien-maldives', 'huong-bien', 'Hương muối biển và cát', ['Muối biển', 'Ozone'], ['Hoa linh lan'], ['Rêu sồi', 'Gỗ lũa']],
  ['Khu Vườn Mùa Xuân', 'khu-vuon-mua-xuan', 'huong-trai-cay', 'Hương đào & mận nhiệt đới', ['Đào', 'Cam ngọt'], ['Mận', 'Việt quất'], ['Đường phèn']],
  ['Tiệm Cà Phê Paris', 'tiem-ca-phe-paris', 'huong-banh-ngot', 'Hương Caramel Macchiato', ['Cà phê rang'], ['Caramel', 'Sữa tươi'], ['Vanilla', 'Bơ']],
  ['Gỗ Đàn Hương Cổ Điển', 'go-dan-huong-co-dien', 'huong-go', 'Hương gỗ ấm trầm, tĩnh tâm', ['Gừng', 'Tiêu đen'], ['Nhũ hương'], ['Đàn hương', 'Hổ phách']],
  ['Hồng Ân (Rose Grace)', 'hong-an-rose', 'huong-hoa', 'Hương hoa hồng sương mai', ['Lá xanh', 'Chanh'], ['Hoa hồng Damask'], ['Gỗ đàn hương']],
  ['Sớm Mai Tươi Mát', 'som-mai-tuoi-mat', 'huong-bien', 'Hương Linen sạch sẽ', ['Không khí sạch'], ['Vải cotton', 'Hoa mẫu đơn'], ['Xạ hương trắng']],
  ['Táo Quế Đêm Đông', 'tao-que-dem-dong', 'huong-trai-cay', 'Hương bánh táo nướng mùa đông', ['Táo đỏ'], ['Quế', 'Đinh hương'], ['Vanilla', 'Đường nâu']],
  ['Lớp Học Làm Bánh', 'lop-hoc-lam-banh', 'huong-banh-ngot', 'Hương bánh quy bơ', ['Bơ lạt'], ['Bột mì nướng', 'Hạnh nhân'], ['Vanilla', 'Đường mía']],
];

const PIN = [
  'https://i.pinimg.com/474x/0a/1b/01/0a1b01dce8e825dd73028ce5e0b87fae.jpg',
  'https://i.pinimg.com/474x/0a/2d/ec/0a2decdb42da6c7299fda5e9e45a840c.jpg',
  'https://i.pinimg.com/474x/0b/06/4e/0b064e52271c7ff076e5baec78e6b8c2.jpg',
  'https://i.pinimg.com/474x/0b/20/8b/0b208be476a74346b98df0e8e476bc5f.jpg',
  'https://i.pinimg.com/474x/0c/2d/c8/0c2dc81bc1a1c2b3ea9e438c0505013c.jpg',
  'https://i.pinimg.com/474x/0c/9e/eb/0c9eeb80032422dd4fcb04fd9b61a051.jpg',
  'https://i.pinimg.com/474x/0c/50/b3/0c50b324d5fed16b38458eeb1b6cb731.jpg',
  'https://i.pinimg.com/474x/0c/79/a9/0c79a9039fb1e89a3fc6240f17a31097.jpg',
  'https://i.pinimg.com/474x/0c/82/7e/0c827ec7e78c8f3b796c6c0992208fcb.jpg',
  'https://i.pinimg.com/474x/0c/82/9c/0c829c77704c591db9cf17dec63af6e2.jpg',
  'https://i.pinimg.com/474x/0c/66/22/0c6622bb09ef08ae272941680b79b597.jpg',
];

const PRODUCT_IMAGES = {
  'da-lat-suong-mu':      [PIN[0],  PIN[1]],
  'tra-chieu-hoang-gia':  [PIN[2],  PIN[3]],
  'gio-bien-maldives':    [PIN[4],  PIN[5]],
  'khu-vuon-mua-xuan':    [PIN[6],  PIN[7]],
  'tiem-ca-phe-paris':    [PIN[8],  PIN[9]],
  'go-dan-huong-co-dien': [PIN[10], PIN[0]],
  'hong-an-rose':         [PIN[1],  PIN[2]],
  'som-mai-tuoi-mat':     [PIN[3],  PIN[4]],
  'tao-que-dem-dong':     [PIN[5],  PIN[6]],
  'lop-hoc-lam-banh':     [PIN[7],  PIN[8]],
};

export function buildProduct([name, slug, , shortDesc, top, middle, base], cat) {
  const intensity = 3 + Math.floor(Math.random() * 3);
  const woodWick = Math.random() < 0.5;
  const prefix = slug.slice(0, 3).toUpperCase();
  const imgs = PRODUCT_IMAGES[slug] || [
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80',
    'https://images.unsplash.com/photo-1596433809252-260c2746af50?w=600&q=80',
    'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&q=80',
  ];
  return {
    name, slug,
    description: `Nến thơm ${name} - Mang lại không gian sống của bạn trải nghiệm ${shortDesc.toLowerCase()} tuyệt vời nhất. Thành phần 100% sáp tự nhiên an toàn cho sức khỏe.`,
    shortDescription: shortDesc,
    category: { categoryId: cat._id, name: cat.name, slug: cat.slug },
    tags: ['handmade', 'soy-wax'],
    candleAttributes: {
      waxType: 'Sáp cọ & Sáp đậu nành',
      wickType: woodWick ? 'Bấc gỗ lách tách' : 'Bấc cotton không chì',
      burnTimeHours: 40, origin: 'Việt Nam',
    },
    scentProfile: { scentName: cat.name, intensity, notes: { top, middle, base } },
    images: imgs,
    isActive: true,
    isFeatured: Math.random() < 0.5,
    variants: [
      { sku: `${prefix}-100G`, sizeLabel: '100g', weightGrams: 100, price: 189000, stockQuantity: 50, images: [imgs[0]], isActive: true },
      { sku: `${prefix}-200G`, sizeLabel: '200g', weightGrams: 200, price: 349000, compareAtPrice: 380000, stockQuantity: 30, images: [imgs[1]], isActive: true },
    ],
  };
}

const now = () => new Date();
const addDays = (d) => new Date(Date.now() + d * 86400000);
const addMonths = (m) => new Date(Date.now() + m * 30 * 86400000);

export const COUPONS = [
  { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minOrderValue: 200000, maxDiscountAmount: 100000, startDate: now(), endDate: addMonths(2), usageLimit: 100 },
  { code: 'FREESHIP', discountType: 'fixed_amount', discountValue: 30000, minOrderValue: 300000, startDate: now(), endDate: addMonths(1), usageLimit: 500 },
  { code: 'SUMMER15', discountType: 'percentage', discountValue: 15, minOrderValue: 150000, maxDiscountAmount: 50000, startDate: now(), endDate: addDays(30) },
  { code: 'VIP50', discountType: 'fixed_amount', discountValue: 50000, minOrderValue: 500000, startDate: now(), endDate: addMonths(12) },
  { code: 'BIRTHDAY', discountType: 'percentage', discountValue: 25, minOrderValue: 200000, maxDiscountAmount: 150000, startDate: now(), endDate: addDays(7) },
  { code: 'WEEKEND', discountType: 'percentage', discountValue: 10, minOrderValue: 0, maxDiscountAmount: 30000, startDate: now(), endDate: addDays(2) },
  { code: 'NEWYEAR', discountType: 'fixed_amount', discountValue: 88000, minOrderValue: 888000, startDate: now(), endDate: addMonths(1) },
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderValue: 0, maxDiscountAmount: 50000, startDate: now(), endDate: addMonths(12) },
];

export const CUSTOMERS = [
  ['lannguyen@gmail.com', 'Lan', 'Nguyễn', '0911111111'],
  ['minhtran@gmail.com', 'Minh', 'Trần', '0922222222'],
  ['hoangpham@gmail.com', 'Hoàng', 'Phạm', '0933333333'],
  ['thuyvu@gmail.com', 'Thủy', 'Vũ', '0944444444'],
  ['anhle@gmail.com', 'Anh', 'Lê', '0955555555'],
];

export const REVIEW_TEXTS = [
  [5, 'Hương thơm thư giãn', 'Mùi gỗ thông cực kỳ dễ chịu, bấc kêu lách tách nghe rất êm tai.'],
  [5, 'Thơm sang', 'Mình rất thích hương trà quyện với nhài. Cực kì thư giãn sau ngày làm việc.'],
  [4, 'Tuyệt vời', 'Hương thơm như đang ở biển thực sự. Thiết kế lọ nến cũng rất xinh.'],
  [5, 'Mùi trái cây ngọt ngào', 'Không bị hắc, ngọt thanh rất hợp đốt trong phòng ngủ.'],
  [4, 'Ngon như kẹo', 'Đốt lên mà cứ thèm uống cafe caramel hoài thôi, ngon lắm.'],
  [5, 'Mùi gỗ trầm đỉnh', 'Dành cho ai thích sự tĩnh tâm, thiền định. Thơm lừng phòng.'],
];

export const POSTS = [
  {
    title: 'Cách chọn nến thơm phù hợp cho từng không gian',
    slug: 'cach-chon-nen-thom-phu-hop',
    excerpt: 'Hướng dẫn chọn mùi hương và kích thước nến theo từng phòng trong nhà.',
    category: 'Mẹo hay',
    authorName: 'Nến Thơm ABC',
    status: 'published',
    thumbnailUrl: 'https://i.pinimg.com/474x/0c/82/9c/0c829c77704c591db9cf17dec63af6e2.jpg',
    content: '<h2>Chọn nến theo không gian</h2><p>Phòng ngủ nên dùng hương lavender, vani dịu nhẹ giúp thư giãn. Phòng khách hợp hương gỗ, trầm ấm tạo cảm giác sang trọng.</p><h3>Kích thước phù hợp</h3><p>Phòng nhỏ dùng nến 100g, phòng lớn nên chọn 200g trở lên để hương lan tỏa đều.</p>',
  },
  {
    title: 'Bí quyết để nến cháy đều và bền hơn',
    slug: 'bi-quyet-nen-chay-deu',
    excerpt: 'Những lưu ý nhỏ giúp nến của bạn cháy đẹp và lâu hết.',
    category: 'Mẹo hay',
    authorName: 'Nến Thơm ABC',
    status: 'published',
    thumbnailUrl: 'https://i.pinimg.com/474x/0c/66/22/0c6622bb09ef08ae272941680b79b597.jpg',
    content: '<h2>Lần đốt đầu tiên rất quan trọng</h2><p>Hãy để nến cháy đủ lâu cho lớp sáp bề mặt tan đều, tránh hiện tượng lõm giữa.</p><h3>Cắt bấc trước mỗi lần đốt</h3><p>Giữ bấc ở mức ~5mm để ngọn lửa ổn định, không bị khói đen.</p>',
  },
  {
    title: 'Lợi ích của sáp đậu nành tự nhiên',
    slug: 'loi-ich-sap-dau-nanh',
    excerpt: 'Vì sao nên chọn nến làm từ sáp đậu nành thay vì paraffin.',
    category: 'Kiến thức',
    authorName: 'Nến Thơm ABC',
    status: 'published',
    thumbnailUrl: 'https://i.pinimg.com/474x/0a/1b/01/0a1b01dce8e825dd73028ce5e0b87fae.jpg',
    content: '<h2>An toàn cho sức khỏe</h2><p>Sáp đậu nành cháy sạch, ít muội than, thân thiện môi trường và thời gian cháy lâu hơn paraffin.</p>',
  },
];
