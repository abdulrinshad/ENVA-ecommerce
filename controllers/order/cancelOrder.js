const Order = require("../../models/order.model");
const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled"
      });
    }

    order.status = "Cancelled";

    if (order.paymentMethod !== "cod" && order.paymentStatus === "paid") {

      const user = await User.findById(req.user.id);

      user.wallet.balance += order.finalAmount;

      user.wallet.transactions.push({
        type: "credit",
        amount: order.finalAmount,
        description: "Order cancellation refund"
      });

      await user.save();

      order.paymentStatus = "refunded";
    }

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Cancel failed"
    });

  }
};