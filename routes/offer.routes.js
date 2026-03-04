const express = require("express");
const router = express.Router();

const offerController = require("../controllers/offer");
const { protect, adminOnly } = require("../middleware/auth.middleware");

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create new offer
router.post("/", protect, adminOnly, offerController.createOffer);

// Get all offers (admin table)
router.get("/", protect, adminOnly, offerController.getAllOffers);

// Delete offer
router.delete("/:id", protect, adminOnly, offerController.deleteOffer);


/* ======================================================
   SHOP ROUTES
====================================================== */

// Get products with applied offers (shop page)
router.get("/shop-products", offerController.getShopProducts);

// Get single product with offer
router.get("/product/:id", offerController.getSingleShopProduct);


module.exports = router;