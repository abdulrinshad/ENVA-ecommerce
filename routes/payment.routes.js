const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const Cart = require("../models/cart.model");
const { protect } = require("../middleware/auth.middleware");

/* =========================
   CREATE RAZORPAY ORDER
========================= */
router.post("/create-order", protect, async (req, res) => {
  try {
    // 1️⃣ Get cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2️⃣ Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    // 3️⃣ Coupon discount (if any)
    const discount = cart.coupon?.discount || 0;

    // 4️⃣ Shipping
    const shipping = 5;

    // 5️⃣ Final amount
    const finalAmount = Math.max(subtotal - discount + shipping, 0);

    // 6️⃣ Razorpay expects paise
    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`
    });

    res.json(order);

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

module.exports = router;
