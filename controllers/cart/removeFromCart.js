const Cart = require("../../models/cart.model");
const calculateTotals = require("./calculatetotals");

module.exports = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const itemExists = cart.items.some(
      i => i._id.toString() === req.params.itemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    cart.items = cart.items.filter(
      i => i._id.toString() !== req.params.itemId
    );

    // Reset coupon when cart changes
    cart.coupon = null;

    calculateTotals(cart);
    await cart.save();

    res.json({
      success: true,
      message: "Item removed successfully"
    });

  } catch (error) {
    console.error("REMOVE ITEM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item"
    });
  }
};