const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pickupDate } = req.body;

    const order = await Order.findById(orderId);

    if (!order || !order.returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    if (order.returnRequest.status !== "RETURN_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: "Pickup already scheduled or completed"
      });
    }

    order.returnRequest.status = "PICKUP_SCHEDULED";
    order.returnRequest.pickupDate = pickupDate;

    await order.save();

    res.json({
      success: true,
      message: "Pickup scheduled"
    });

  } catch (error) {
    console.error("SCHEDULE PICKUP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule pickup"
    });
  }
};