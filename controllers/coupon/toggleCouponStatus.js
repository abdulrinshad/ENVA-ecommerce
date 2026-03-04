const Coupon = require("../../models/coupon.model");

module.exports = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      isActive: coupon.isActive
    });

  } catch (error) {
    console.error("TOGGLE COUPON ERROR:", error);
    res.status(500).json({
      success: false
    });
  }
};