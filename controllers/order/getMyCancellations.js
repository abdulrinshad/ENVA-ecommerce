const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const orders = await Order.find({
      user: req.user.id
    })
    .populate("items.product")
    .sort({ createdAt: -1 });

    const cancellations = [];

    orders.forEach(order => {

      order.items.forEach(item => {

        if (item.cancelStatus !== "NONE") {

          cancellations.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemId: item._id,
            name: item.name,
            qty: item.qty,
            price: item.price,
            cancelStatus: item.cancelStatus,
            product: item.product,
            createdAt: order.createdAt
          });

        }

      });

    });

    res.json({
      success: true,
      cancellations
    });

  } catch (err) {

    console.error("GET CANCELLATIONS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load cancellations"
    });

  }
};