const Order = require("../../models/order.model");

module.exports = async (req, res) => {
  try {
    const {
      status,
      search,
      paymentStatus,
      date,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};
    const skip = (page - 1) * limit;

    /* =========================
       STATUS FILTER
    ========================= */
    if (status) {
      filter.status = status;
    }

    /* =========================
       PAYMENT FILTER
    ========================= */
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    /* =========================
       DATE FILTER
    ========================= */
    if (date) {
      const now = new Date();
      let startDate;

      if (date === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      }

      if (date === "7days") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      }

      if (date === "1month") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
      }

      if (date === "1year") {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    /* =========================
       SEARCH FILTER
    ========================= */
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } }
      ];
    }

    /* =========================
       TOTAL COUNT
    ========================= */
    const totalOrders = await Order.countDocuments(filter);

    /* =========================
       FETCH ORDERS
    ========================= */
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page)
    });

  } catch (error) {
    console.error("ADMIN ORDER MANAGEMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};