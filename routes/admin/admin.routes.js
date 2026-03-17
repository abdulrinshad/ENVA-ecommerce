const express = require("express");
const router = express.Router();

const customerRoutes = require("./admin.customer.routes");
const productRoutes = require("./admin.product.routes");
const profileRoutes = require("./admin.profile.routes");
const orderRoutes = require("./adminOrder.routes");

router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/profile", profileRoutes);
router.use("/orders", orderRoutes);

module.exports = router;