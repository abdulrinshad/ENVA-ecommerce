const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const { orderId, itemId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    if (item.cancelStatus !== "NONE") {
      return res.status(400).json({
        success: false,
        message: "Cancel already requested"
      });
    }

    item.cancelStatus = "REQUESTED";
    item.adminMessage = "Cancellation requested by user";

    await order.save();

    res.json({
      success: true,
      message: "Item cancellation requested"
    });

  } catch (error) {

    console.error("ITEM CANCEL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Cancel failed"
    });

  }
};