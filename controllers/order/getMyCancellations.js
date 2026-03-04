const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const orders = await Order.find({
      user: req.user.id,
      "items.cancelStatus": { $ne: "NONE" }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Failed to load cancellations"
    });

  }
};