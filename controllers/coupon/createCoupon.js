const Coupon = require("../../models/coupon.model");

module.exports = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minSpend,
      maxUses,
      oneTime,
      startDate,
      endDate
    } = req.body;

    if (!code || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists"
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minSpend,
      maxUses,
      oneTime,
      startDate,
      endDate
    });

    res.json({
      success: true,
      coupon
    });

  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon"
    });
  }
};