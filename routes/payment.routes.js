const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const paymentController = require("../controllers/payment");

router.post(
  "/create-order",
  protect,
  paymentController.createRazorpayOrder
);

module.exports = router;