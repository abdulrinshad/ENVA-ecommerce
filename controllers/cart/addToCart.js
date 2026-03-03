const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Offer = require("../../models/offer.model");
const calculateTotals = require("./calculatetotals");

module.exports = async (req, res) => {
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
        message: `Only ${availableStock} units available`
      });
    }

    const now = new Date();
    const activeOffers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    let finalPrice = product.price;

    const productOffer = activeOffers.find(
      o => o.type === "product" &&
           o.product?.toString() === product._id.toString()
    );

    const categoryOffer =
      product.category &&
      activeOffers.find(
        o => o.type === "category" &&
             o.category?.toString() === product.category[0]?.toString()
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