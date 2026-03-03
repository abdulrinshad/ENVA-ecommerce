const Cart = require("../../models/cart.model");

module.exports = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = [];
    cart.coupon = null;
    cart.total = 0;
    cart.finalTotal = 0;

    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully"
    });

  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
};