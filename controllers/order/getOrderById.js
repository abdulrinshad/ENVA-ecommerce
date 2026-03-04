const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("items.product", "images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });

  }
};