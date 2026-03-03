const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const wishlistController = require("../controllers/wishlist.controller");

router.post("/", protect, wishlistController.addToWishlist);
router.get("/", protect, wishlistController.getWishlist);
router.delete("/:productId", protect, wishlistController.removeFromWishlist);

module.exports = router;
