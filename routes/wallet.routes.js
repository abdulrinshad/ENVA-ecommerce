const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getWallet,
  addMoneyToWallet
} = require("../controllers/wallet.controller");

/* =====================
   GET WALLET DETAILS
===================== */
router.get("/", protect, getWallet);

/* =====================
   ADD MONEY TO WALLET
===================== */
router.post("/add", protect, addMoneyToWallet);

module.exports = router;
