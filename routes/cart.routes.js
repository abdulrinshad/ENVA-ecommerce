const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart
} = require("../controllers/cart.controller");

const { protect } = require("../middleware/auth.middleware");

/* =========================
   CART ROUTES (PROTECTED)
========================= */

// Get logged-in user's cart
router.get("/", protect, getCart);

// Add item to cart
router.post("/add", protect, addToCart);

// Update quantity (+ / -)
router.put("/update", protect, updateCartItem);

// Remove item
router.delete("/remove/:itemId", protect, removeFromCart);

// Apply coupon
router.post("/apply-coupon", protect, applyCoupon);

// Clear cart (after checkout)
router.delete("/clear", protect, clearCart);

module.exports = router;
