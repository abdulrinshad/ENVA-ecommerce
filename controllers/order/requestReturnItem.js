const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const { orderId, itemId } = req.params;
    const { reason, returnQty } = req.body;

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

    const remainingQty = item.qty - item.returnedQty;

    if (returnQty > remainingQty || returnQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid return quantity"
      });
    }

    item.returnStatus = "REQUESTED";
    item.returnReason = reason;
    item.requestedReturnQty = returnQty;

    await order.save();

    res.json({
      success: true,
      message: "Return requested"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Return failed"
    });

  }
};