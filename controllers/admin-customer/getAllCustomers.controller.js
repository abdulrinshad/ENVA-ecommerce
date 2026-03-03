const User = require("../../models/user.model");
const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });

        const ordersCount = orders.length;
        const totalSpent = orders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );

        return {
          ...user.toObject(),
          ordersCount,
          totalSpent
        };
      })
    );

    const stats = {
      total: customersWithStats.length,
      active: customersWithStats.filter(u => !u.isBlocked).length,
      blocked: customersWithStats.filter(u => u.isBlocked).length
    };

    res.json({
      success: true,
      stats,
      users: customersWithStats
    });

  } catch (err) {
    console.error("GET CUSTOMERS ERROR:", err);
    res.status(500).json({ success: false });
  }
};