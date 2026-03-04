const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order status
    order.status = status;

    /* ======================================
       SET DELIVERY DATE
    ====================================== */
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    /* ======================================
       COD PAYMENT AUTO UPDATE
    ====================================== */
    if (
      order.paymentMethod === "cod" &&
      status === "Delivered" &&
      order.paymentStatus === "pending"
    ) {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      status: order.status,
      paymentStatus: order.paymentStatus
    });

  } catch (error) {
    console.error("ADMIN UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};