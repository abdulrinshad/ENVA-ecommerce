const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const orders = await Order.find({
      user: req.user.id,
      "items.returnStatus": { $ne: "NONE" }
    }).sort({ createdAt: -1 });

    const formattedReturns = [];

    orders.forEach(order => {

      order.items.forEach(item => {

        if (item.returnStatus && item.returnStatus !== "NONE") {

          formattedReturns.push({
            orderId: order._id,
            orderDate: order.createdAt,
            returnStatus: item.returnStatus,
            returnedQty: item.returnedQty || 0,
            orderedQty: item.qty || 0,
            price: item.price || 0,
            adminMessage: item.adminMessage || ""
          });

        }

      });

    });

    res.json({
      success: true,
      returns: formattedReturns
    });

  } catch (err) {

    console.error("GET MY RETURNS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load returns"
    });

  }
};