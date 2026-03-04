const Cart = require("../../models/cart.model");

module.exports = async (req, res) => {
  try {

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.json({
        items: [],
        total: 0,
        finalTotal: 0
      });
    }

    res.json(cart);

  } catch (error) {

    console.error("GET CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });

  }
};