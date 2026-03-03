const Cart = require("../../models/cart.model");
const Coupon = require("../../models/coupon.model");
const calculateTotals = require("./calculatetotals");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id;
    const code = req.body.code?.toUpperCase()?.trim();

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

    // Recalculate cart before applying coupon
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

    cart.coupon = {
      code: coupon.code,
      discount
    };

    cart.finalTotal = cart.total - discount;

    await cart.save();

    res.json({
      success: true,
      total: cart.total,
      discount,
      finalTotal: cart.finalTotal
    });

  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Coupon apply failed"
    });
  }
};