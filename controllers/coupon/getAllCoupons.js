const Coupon = require("../../models/coupon.model");
const autoExpireCoupons = require("./autoExpireCoupons");

module.exports = async (req, res) => {
  try {
    await autoExpireCoupons();

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error("GET ALL COUPONS ERROR:", error);
    res.status(500).json({
      success: false
    });
  }
};