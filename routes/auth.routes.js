const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");


/* =====================================================
   ADMIN ROUTES
===================================================== */

// Create Admin (only for initial setup)
router.post("/admin/create", authController.createAdmin);

// Admin Login
router.post("/admin/login", authController.adminLogin);

// Get Logged-in Admin Profile
router.get(
  "/admin/profile",
  protect,
  adminOnly,
  authController.getAdminProfile
);

// Change Admin Password
router.put(
  "/admin/change-password",
  protect,
  adminOnly,
  authController.changeAdminPassword
);


// Get Logged-in User Profile
router.get("/me", protect, authController.getUserProfile);



/* =====================================================
   USER AUTH ROUTES
===================================================== */

// Register User (OTP based)
router.post("/register", authController.register);

// Verify Signup OTP
router.post("/verify-otp", authController.verifyOtp);

// User Login
router.post("/login", authController.userLogin);

// Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Verify Reset OTP
router.post("/verify-reset-otp", authController.verifyResetOtp);

// Reset Password
router.post("/reset-password", authController.resetPassword);



/* =====================================================
   GOOGLE AUTH
===================================================== */

router.post("/google", authController.googleAuth);



/* =====================================================
   EXPORT
===================================================== */

module.exports = router;
