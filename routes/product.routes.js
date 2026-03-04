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

router.get("/trending", getTrendingProducts);

router.get("/", getAllProducts);

router.get("/:id", getPublicProductById);

module.exports = router;