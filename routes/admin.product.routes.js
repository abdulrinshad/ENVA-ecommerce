const express = require("express");
const router = express.Router();

const createProduct = require("../controllers/product-admin/createProduct.controller");
const getAllProducts = require("../controllers/product-admin/getAllproduct.controller");
const getSingleProduct = require("../controllers/product-admin/getsingleproduct.controller");
const updateProduct = require("../controllers/product-admin/updateProduct.controller");
const deleteProduct = require("../controllers/product-admin/deleteProduct.controller");
const toggleTrending = require("../controllers/product-admin/toggleTrending.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload"); // 🔥 IMPORTANT

/* =====================================================
   ADMIN PRODUCT ROUTES
   Mounted at: /api/admin
===================================================== */


/* =====================================================
   CREATE PRODUCT
   POST /api/admin/products
===================================================== */
router.post(
  "/products",
  protect,
  adminOnly,
  upload.array("images", 5),   // 🔥 REQUIRED FOR FORM-DATA
  createProduct
);


/* =====================================================
   GET ALL PRODUCTS
   GET /api/admin/products
===================================================== */
router.get(
  "/products",
  protect,
  adminOnly,
  getAllProducts
);


/* =====================================================
   TOGGLE TRENDING
   PUT /api/admin/products/toggle-trending/:id
   ⚠ KEEP THIS BEFORE /:id ROUTES
===================================================== */
router.put(
  "/products/toggle-trending/:id",
  protect,
  adminOnly,
  toggleTrending
);


/* =====================================================
   GET SINGLE PRODUCT
   GET /api/admin/products/:id
===================================================== */
router.get(
  "/products/:id",
  protect,
  adminOnly,
  getSingleProduct
);


/* =====================================================
   UPDATE PRODUCT
   PUT /api/admin/products/:id
===================================================== */
router.put(
  "/products/:id",
  protect,
  adminOnly,
  upload.array("images", 5),   // 🔥 REQUIRED FOR IMAGE UPDATE
  updateProduct
);


/* =====================================================
   DELETE PRODUCT
   DELETE /api/admin/products/:id
===================================================== */
router.delete(
  "/products/:id",
  protect,
  adminOnly,
  deleteProduct
);


module.exports = router;