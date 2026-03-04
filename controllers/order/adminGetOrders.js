const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const { status, page = 1 } = req.query;

    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.paymentStatus = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Admin fetch failed"
    });

  }
};