const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const completed = await Order.countDocuments({
      paymentStatus: "paid",
      createdAt: { $gte: last7Days }
    });

    const pending = await Order.countDocuments({
      paymentStatus: "pending",
      createdAt: { $gte: last7Days }
    });

    const failed = await Order.countDocuments({
      paymentStatus: "failed",
      createdAt: { $gte: last7Days }
    });

    const revenueAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalAmount" }
        }
      }
    ]);

    res.json({
      success: true,
      totalRevenue: revenueAgg[0]?.total || 0,
      completed,
      pending,
      failed
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Stats fetch failed"
    });

  }
};