const Cart = require("../../models/cart.model");
const calculateTotals = require("./calculatetotals");

module.exports = async (req, res) => {
  try {
    const { itemId, qtyDelta } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "sizes");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
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

    // Reset coupon when cart changes
    cart.coupon = null;

    calculateTotals(cart);
    await cart.save();

    res.json({
      success: true,
      message: "Cart updated"
    });

  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
};