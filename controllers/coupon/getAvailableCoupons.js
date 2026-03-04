const Coupon = require("../../models/coupon.model");
const autoExpireCoupons = require("./autoExpireCoupons");

module.exports = async (req, res) => {
  try {
    await autoExpireCoupons();

    const cartTotal = Number(req.query.total || 0);
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      minSpend: { $lte: cartTotal }
    }).select("code type value minSpend");

    res.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error("GET AVAILABLE COUPONS ERROR:", error);
    res.status(500).json({
      success: false
    });
  }
};