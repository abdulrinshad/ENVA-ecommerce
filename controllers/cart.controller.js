const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");
const Offer = require("../models/offer.model");

/* =========================
   CALCULATE TOTALS
========================= */
const calculateTotals = (cart) => {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  cart.total = total;

  if (cart.coupon && cart.coupon.discount) {
    cart.finalTotal = Math.max(total - cart.coupon.discount, 0);
  } else {
    cart.finalTotal = total;
    cart.coupon = null;
  }
};

/* =========================
   GET CART
========================= */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name price images sizes totalStock");

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        total: 0,
        finalTotal: 0
      });
    }

    calculateTotals(cart);
    await cart.save();

    res.json(cart);

  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
};

/* =========================
   ADD TO CART (STOCK SAFE)
========================= */
exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1, size } = req.body;

    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Please select a size"
      });
    }

    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const availableStock = product.sizes?.[size] || 0;

    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: `Size ${size} is out of stock`
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      i => i.product.toString() === productId && i.size === size
    );

    const alreadyInCart = existingItem ? existingItem.qty : 0;

    if (alreadyInCart + qty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} units available. You already have ${alreadyInCart} in cart.`
      });
    }

    /* ========= OFFER LOGIC ========= */
    const now = new Date();

    const activeOffers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    let finalPrice = product.price;

    const productOffer = activeOffers.find(
      o =>
        o.type === "product" &&
        o.product &&
        o.product.toString() === product._id.toString()
    );

    const categoryOffer =
      product.category &&
      activeOffers.find(
        o =>
          o.type === "category" &&
          o.category &&
          o.category.toString() === product.category[0]?.toString()
      );

    const appliedOffer = productOffer || categoryOffer;

    if (appliedOffer) {
      if (appliedOffer.discountType === "percentage") {
        finalPrice = Math.round(
          product.price -
          (product.price * appliedOffer.discountValue) / 100
        );
      } else {
        finalPrice = Math.max(
          0,
          product.price - appliedOffer.discountValue
        );
      }
    }

    /* ========= ADD / UPDATE ========= */
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({
        product: productId,
        qty,
        size,
        price: finalPrice
      });
    }

    cart.coupon = null;

    calculateTotals(cart);
    await cart.save();

    res.json({
      success: true,
      message: "Added to cart successfully"
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =========================
   UPDATE QTY (STOCK SAFE)
========================= */
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, qtyDelta } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "sizes");

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const availableStock = item.product.sizes?.[item.size] || 0;
    const newQty = item.qty + qtyDelta;

    if (newQty < 1) {
      item.qty = 1;
    } else if (newQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} units available`
      });
    } else {
      item.qty = newQty;
    }

    cart.coupon = null;

    calculateTotals(cart);
    await cart.save();

    res.json({
      success: true,
      message: "Cart updated"
    });

  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

/* =========================
   REMOVE ITEM
========================= */
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(
      i => i._id.toString() !== req.params.itemId
    );

    cart.coupon = null;

    calculateTotals(cart);
    await cart.save();

    res.json({ success: true });

  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/* =========================
   APPLY COUPON
========================= */
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const code = req.body.code?.toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive coupon"
      });
    }

    const now = new Date();

    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired or inactive"
      });
    }

    if (coupon.oneTime && coupon.usedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Coupon already used"
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    calculateTotals(cart);

    if (cart.total < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum spend ₹${coupon.minSpend} required`
      });
    }

    let discount =
      coupon.type === "percentage"
        ? Math.round((cart.total * coupon.value) / 100)
        : coupon.value;

    discount = Math.min(discount, cart.total);

    cart.coupon = { code: coupon.code, discount };
    cart.finalTotal = cart.total - discount;

    await cart.save();

    res.json({
      success: true,
      total: cart.total,
      discount,
      finalTotal: cart.finalTotal
    });

  } catch (err) {
    console.error("Coupon error:", err);
    res.status(500).json({
      success: false,
      message: "Coupon apply failed"
    });
  }
};

/* =========================
   CLEAR CART
========================= */
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], coupon: null, total: 0, finalTotal: 0 }
    );

    res.json({ success: true });

  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};