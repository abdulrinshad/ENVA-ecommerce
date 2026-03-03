const express = require("express");
const router = express.Router();

const couponController = require("../controllers/coupon.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

/* =========================
   USER / CART
========================= */
router.get(
  "/available",
  protect,
  couponController.getAvailableCoupons
);

/* =========================
   ADMIN
========================= */
router.post(
  "/",
  protect,
  adminOnly,
  couponController.createCoupon
);

router.get(
  "/",
  protect,
  adminOnly,
  couponController.getAllCoupons
);

router.patch(
  "/:id/toggle",
  protect,
  adminOnly,
  couponController.toggleCouponStatus
);

module.exports = router;
