const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "Delivered"
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be returned"
      });
    }

    // Better practice: mark as Return Requested
    order.status = "Return Requested";
    await order.save();

    res.json({
      success: true,
      message: "Return requested successfully"
    });

  } catch (error) {
    console.error("RETURN ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Return failed"
    });
  }
};