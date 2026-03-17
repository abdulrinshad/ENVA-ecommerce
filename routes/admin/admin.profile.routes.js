const express = require("express");
const router = express.Router();

const { getProfile, changePassword } = require("../../controllers/admin");
const { protect, adminOnly } = require("../../middleware/auth.middleware");

// GET ADMIN PROFILE
router.get("/profile", protect, adminOnly, getProfile);

// CHANGE ADMIN PASSWORD
router.put("/change-password", protect, adminOnly, changePassword);

module.exports = router;