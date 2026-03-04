const Order = require("../../models/order.model");

module.exports = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");

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

  } catch (error) {

    console.error("GET SINGLE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};