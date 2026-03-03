const Order = require("../../models/order.model");
const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user");

    if (!order || !order.returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    if (order.returnRequest.status !== "PICKUP_SCHEDULED") {
      return res.status(400).json({
        success: false,
        message: "Return not ready to complete"
      });
    }

    order.returnRequest.status = "RETURN_SUCCESSFUL";
    order.returnRequest.completedAt = new Date();

    /* =========================
       REFUND PREPAID ORDERS
    ========================= */
    if (order.paymentMethod !== "cod" && order.paymentStatus === "paid") {

      const user = await User.findById(order.user._id);

      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }

      user.wallet.balance += order.total;

      user.wallet.transactions.push({
        type: "credit",
        amount: order.total,
        description: "Return refund"
      });

      await user.save();
      order.paymentStatus = "refunded";
    }

    await order.save();

    res.json({
      success: true,
      message: "Return completed successfully"
    });

  } catch (error) {
    console.error("COMPLETE RETURN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete return"
    });
  }
};