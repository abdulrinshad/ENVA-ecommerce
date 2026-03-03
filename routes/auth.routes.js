const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const adminController = require("../controllers/admin");

const { protect, adminOnly } = require("../middleware/auth.middleware");


/* =====================================================
   ADMIN ROUTES
===================================================== */

// Create Admin
router.post("/admin/create", authController.createAdmin);

// Admin Login
router.post("/admin/login", authController.adminLogin);

// Get Logged-in Admin Profile
router.get(
  "/admin/profile",
  protect,
  adminOnly,
  adminController.getProfile
);

// Change Admin Password
router.put(
  "/admin/change-password",
  protect,
  adminOnly,
  adminController.changePassword
);


/* =====================================================
   USER ROUTES
===================================================== */

// Get Logged-in User Profile
router.get("/me", protect, userController.getProfile);


/* =====================================================
   USER AUTH ROUTES
===================================================== */

// Register
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


module.exports = router;