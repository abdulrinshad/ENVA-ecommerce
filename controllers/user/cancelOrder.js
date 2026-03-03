const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "Placed"
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled"
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Cancel failed"
    });
  }
};