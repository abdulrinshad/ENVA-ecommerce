const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offer.controller");

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create new offer
router.post("/", offerController.createOffer);

router.get("/product/:id", offerController.getSingleShopProduct);
// Get all offers (admin table)
router.get("/", offerController.getAllOffers);

// Delete offer
router.delete("/:id", offerController.deleteOffer);



/* ======================================================
   SHOP ROUTES
====================================================== */

// Get products with applied offers (shop page)
router.get("/shop-products", offerController.getShopProducts);

module.exports = router;
