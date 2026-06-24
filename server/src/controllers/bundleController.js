import asyncHandler from 'express-async-handler';
import Bundle from '../models/Bundle.js';
import Product from '../models/Product.js';

// GET /admin/bundles
export const listBundles = asyncHandler(async (_req, res) => {
  const bundles = await Bundle.find().sort({ createdAt: -1 }).lean();
  res.json(bundles);
});

// GET /admin/bundles/:id
export const getBundle = asyncHandler(async (req, res) => {
  const bundle = await Bundle.findById(req.params.id).lean();
  if (!bundle) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(bundle);
});

// POST /admin/bundles
export const createBundle = asyncHandler(async (req, res) => {
  const { mainProductId, companions, discountPercent, label, isActive } = req.body;

  // Check duplicate
  const exists = await Bundle.findOne({ mainProductId });
  if (exists) return res.status(409).json({ message: 'Sản phẩm chính đã có bundle' });

  const mainProduct = await Product.findById(mainProductId).lean();
  if (!mainProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm chính' });

  const bundle = await Bundle.create({
    mainProductId,
    mainProductName: mainProduct.name,
    companions: companions || [],
    discountPercent: discountPercent ?? 10,
    label: label || 'Mua kèm tiết kiệm',
    isActive: isActive ?? true,
  });
  res.status(201).json(bundle);
});

// PUT /admin/bundles/:id
export const updateBundle = asyncHandler(async (req, res) => {
  const { mainProductId, companions, discountPercent, label, isActive } = req.body;

  const update = { companions, discountPercent, label, isActive };

  if (mainProductId) {
    const mainProduct = await Product.findById(mainProductId).lean();
    if (!mainProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm chính' });
    update.mainProductId = mainProductId;
    update.mainProductName = mainProduct.name;
  }

  const bundle = await Bundle.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!bundle) return res.status(404).json({ message: 'Không tìm thấy' });
  res.json(bundle);
});

// DELETE /admin/bundles/:id
export const deleteBundle = asyncHandler(async (req, res) => {
  await Bundle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xoá' });
});

// GET /bundles/by-product/:productId  (public — dùng cho ProductDetail)
export const bundleByProduct = asyncHandler(async (req, res) => {
  const bundle = await Bundle.findOne({
    mainProductId: req.params.productId,
    isActive: true,
  }).lean();

  if (!bundle) return res.json(null);

  // Enrich companions với giá thực từ Product
  const ids = bundle.companions.map((c) => c.productId);
  const products = await Product.find({ _id: { $in: ids } })
    .select('name slug images variants reviewCount')
    .lean();

  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  bundle.companions = bundle.companions.map((c) => {
    const p = productMap[c.productId?.toString()];
    if (!p) return c;
    const v = p.variants?.[0];
    return {
      ...c,
      _id: p._id,
      name: p.name,
      slug: p.slug,
      images: p.images,
      variants: p.variants,
      reviewCount: p.reviewCount,
      imageUrl: p.images?.[0] || v?.images?.[0] || c.imageUrl,
    };
  });

  res.json(bundle);
});
