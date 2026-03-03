const Coupon = require("../models/coupon.model");

/* =========================
   CREATE COUPON (ADMIN)
========================= */
exports.createCoupon = async (req, res) => {
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
      return res.json({ success: false, message: "Missing fields" });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.json({ success: false, message: "Coupon already exists" });
    }

    const coupon = await Coupon.create({
      code,
      description,
      type,
      value,
      minSpend,
      maxUses,
      oneTime,
      startDate,
      endDate
    });

    res.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   GET ALL COUPONS (ADMIN)
========================= */
exports.getAllCoupons = async (req, res) => {
  try {
    // 🔥 AUTO EXPIRE FIRST
    await exports.autoExpireCoupons();

    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};


/* =========================
   TOGGLE COUPON STATUS
========================= */
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ success: true, isActive: coupon.isActive });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* =========================
   GET AVAILABLE COUPONS (CART)
========================= */
exports.getAvailableCoupons = async (req, res) => {
  try {
    // 🔥 AUTO EXPIRE FIRST
    await exports.autoExpireCoupons();

    const cartTotal = Number(req.query.total || 0);
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      minSpend: { $lte: cartTotal }
    }).select("code type value minSpend");

    res.json({ success: true, coupons });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};



/* =========================
   AUTO EXPIRE COUPONS
========================= */
exports.autoExpireCoupons = async () => {
  const now = new Date();

  await Coupon.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
};
