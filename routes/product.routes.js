const express = require("express");

const {
  createProduct,
  getProductById,
  updateProduct,
  toggleTrending,
  getTrendingProducts,
  getAllProducts,
  getPublicProductById
} = require("../controllers/product");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const Category = require("../models/category.model"); // ✅ ADDED
const Product = require("../models/product.model");   // ✅ ADDED

const router = express.Router();

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.post(
  "/admin/products",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProduct
);

router.get(
  "/admin/products/:id",
  protect,
  adminOnly,
  getProductById
);

router.put(
  "/admin/products/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);

/* TOGGLE TRENDING */

router.patch(
  "/admin/products/:id/trending",
  protect,
  adminOnly,
  toggleTrending
);

/* =====================================================
   PUBLIC ROUTES
===================================================== */

/* -------- TRENDING -------- */
router.get("/trending", getTrendingProducts);

/* =====================================================
   🔍 LIVE SEARCH (ADDED)
===================================================== */

router.get("/search", async (req, res) => {
  try {
    const search = req.query.search?.trim();

    if (!search) {
      return res.json({
        products: [],
        categories: []
      });
    }

    /* -------- PRODUCTS -------- */
    const products = await Product.find({
      name: { $regex: search, $options: "i" },
      isActive: true
    })
      .select("name price images")
      .limit(5);

    /* -------- CATEGORIES -------- */
    const categories = await Category.find({
      name: { $regex: search, $options: "i" },
      isPublished: true
    })
      .select("name slug")
      .limit(5);

    res.json({
      products,
      categories
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

/* -------- ALL PRODUCTS -------- */
router.get("/", getAllProducts);

/* -------- SINGLE PRODUCT -------- */
router.get("/:id", getPublicProductById);

module.exports = router;