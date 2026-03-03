const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { message } = req.body;

    const order = await Order.findById(orderId);
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

    item.cancelStatus = "DECLINED";
    item.adminMessage = message || "Cancellation declined by admin";

    await order.save();

    res.json({ success: true });

  } catch (err) {
    console.error("DECLINE CANCEL ERROR:", err);
    res.status(500).json({ success: false });
  }
};