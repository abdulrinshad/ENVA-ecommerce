const express = require("express");
const mongoose = require("mongoose");

const Product = require("../models/product.model");

const {
  createProduct,
  getProductById,
  updateProduct,
  toggleTrending   // ✅ ADDED
} = require("../controllers/product.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const router = express.Router();

/* =====================================================
   ADMIN ROUTES (KEEP THESE ON TOP TO AVOID CONFLICT)
===================================================== */

/* ADMIN – CREATE PRODUCT */
router.post(
  "/admin/products",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProduct
);



/* ADMIN – GET SINGLE PRODUCT */
router.get(
  "/admin/products/:id",
  protect,
  adminOnly,
  getProductById
);

/* ADMIN – UPDATE PRODUCT */
router.put(
  "/admin/products/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);


/* =========================
   GET TRENDING PRODUCTS
========================= */
router.get("/trending", async (req, res) => {
  try {
    const products = await Product.find({
      trending: true,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(products);

  } catch (error) {
    console.error("GET TRENDING ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/* =====================================================
   PUBLIC ROUTES
===================================================== */

/* PUBLIC – GET ALL PRODUCTS */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* PUBLIC – GET SINGLE PRODUCT */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;