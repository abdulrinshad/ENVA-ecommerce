const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

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

    item.returnStatus = "NONE";
    item.adminMessage =
      "Your return request was declined. Please contact support for more details.";

    await order.save();

    res.json({
      success: true,
      message: "Return declined for this item"
    });

  } catch (error) {
    console.error("DECLINE ITEM RETURN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};