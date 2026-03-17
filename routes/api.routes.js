const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin/admin.routes");

const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const categoryRoutes = require("./category.routes");
const couponRoutes = require("./coupon.routes");
const offerRoutes = require("./offer.routes");
const wishlistRoutes = require("./wishlist.routes");
const addressRoutes = require("./address.routes");
const orderRoutes = require("./order.routes");
const paymentRoutes = require("./payment.routes");
const walletRoutes = require("./wallet.routes");

// auth
router.use("/auth", authRoutes);

// admin
router.use("/admin", adminRoutes);

// user routes
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/categories", categoryRoutes);
router.use("/coupons", couponRoutes);
router.use("/offers", offerRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/address", addressRoutes);
router.use("/orders", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/wallet", walletRoutes);

module.exports = router;