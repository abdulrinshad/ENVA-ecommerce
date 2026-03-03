const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart");
const { protect } = require("../middleware/auth.middleware");

/* =========================
   CART ROUTES (PROTECTED)
========================= */

// Get logged-in user's cart
router.get("/", protect, cartController.getCart);

// Add item to cart
router.post("/add", protect, cartController.addToCart);

// Update quantity (+ / -)
router.put("/update", protect, cartController.updateCartItem);

// Remove item
router.delete("/remove/:itemId", protect, cartController.removeFromCart);

// Apply coupon
router.post("/apply-coupon", protect, cartController.applyCoupon);

// Clear cart
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;