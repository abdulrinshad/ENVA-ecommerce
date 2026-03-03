const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        orderNumber: order.orderNumber,
        customerId: order.user?._id || null,
        customerName: order.user?.name || "Guest",
        createdAt: order.createdAt,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status
      }))
    });

  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};