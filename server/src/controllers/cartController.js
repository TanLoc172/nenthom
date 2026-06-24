import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Resolve the cart for the current request (user or guest session).
// Guest carts: token stored in localStorage client-side, sent as X-Cart-Token header.
// Cookie fallback kept for backwards compat.
async function getOrCreateCart(req, res) {
  if (req.user) {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    return cart;
  }
  // Header takes priority (cross-domain production), cookie is fallback (dev/same-domain)
  let token = req.headers['x-cart-token'] || req.cookies?.cart_token;
  if (!token) {
    token = crypto.randomBytes(16).toString('hex');
    // Send token in response header so client can store in localStorage
    res.setHeader('X-Cart-Token', token);
    res.cookie('cart_token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  let cart = await Cart.findOne({ sessionToken: token });
  if (!cart) cart = await Cart.create({ sessionToken: token, items: [] });
  return cart;
}

// Expand stored items into detailed cart with prices + totals.
async function expandCart(cart) {
  const ids = cart.items.map((i) => i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const it of cart.items) {
    const p = map.get(String(it.productId));
    if (!p) continue;
    const variant = p.variants.find((v) => v.sku === it.variantSku) || p.variants[0];
    if (!variant) continue;
    items.push({
      productId: p._id,
      slug: p.slug,
      name: p.name,
      variantSku: variant.sku,
      sizeLabel: variant.sizeLabel,
      scentName: p.scentProfile?.scentName,
      price: variant.price,
      image: variant.images?.[0] || p.images?.[0] || null,
      stockQuantity: variant.stockQuantity,
      quantity: it.quantity,
      lineTotal: variant.price * it.quantity,
    });
  }
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { id: cart._id, items, subtotal, count };
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req, res);
  res.json(await expandCart(cart));
});

// GET /api/cart/count
export const cartCount = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req, res);
  const count = cart.items.reduce((s, i) => s + i.quantity, 0);
  res.json({ count });
});

// POST /api/cart/items  { productId, variantSku, quantity }
export const addItem = asyncHandler(async (req, res) => {
  const { productId, variantSku, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
  const variant = product.variants.find((v) => v.sku === variantSku) || product.variants[0];
  if (!variant) return res.status(400).json({ message: 'Biến thể không hợp lệ' });

  const cart = await getOrCreateCart(req, res);
  const existing = cart.items.find(
    (i) => String(i.productId) === String(productId) && i.variantSku === variant.sku
  );
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ productId, variantSku: variant.sku, quantity: Number(quantity) });
  await cart.save();
  res.json(await expandCart(cart));
});

// PUT /api/cart/items  { productId, variantSku, quantity }
export const updateItem = asyncHandler(async (req, res) => {
  const { productId, variantSku, quantity } = req.body;
  const cart = await getOrCreateCart(req, res);
  const item = cart.items.find(
    (i) => String(i.productId) === String(productId) && i.variantSku === variantSku
  );
  if (!item) return res.status(404).json({ message: 'Không có trong giỏ' });
  if (quantity <= 0) cart.items = cart.items.filter((i) => i !== item);
  else item.quantity = Number(quantity);
  await cart.save();
  res.json(await expandCart(cart));
});

// DELETE /api/cart/items  { productId, variantSku }
export const removeItem = asyncHandler(async (req, res) => {
  const { productId, variantSku } = req.body;
  const cart = await getOrCreateCart(req, res);
  cart.items = cart.items.filter(
    (i) => !(String(i.productId) === String(productId) && i.variantSku === variantSku)
  );
  await cart.save();
  res.json(await expandCart(cart));
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req, res);
  cart.items = [];
  await cart.save();
  res.json(await expandCart(cart));
});

export { getOrCreateCart, expandCart };
