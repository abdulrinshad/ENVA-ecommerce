const Razorpay = require("razorpay");
const Cart = require("../models/cart.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* =========================
   CREATE RAZORPAY ORDER
========================= */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔐 Always calculate on server
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += item.price * item.qty;
    });

    const discount = cart.coupon?.discount || 0;
    const shipping = 5;

    const finalAmount = subtotal - discount + shipping;

    if (finalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const order = await razorpay.orders.create({
      amount: finalAmount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};
