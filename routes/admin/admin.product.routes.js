const express = require("express");
const router = express.Router();

const createProduct = require("../../controllers/product-admin/createProduct.controller");
const getAllProducts = require("../../controllers/product-admin/getAllproduct.controller");
const getSingleProduct = require("../../controllers/product-admin/getsingleproduct.controller");
const updateProduct = require("../../controllers/product-admin/updateProduct.controller");
const deleteProduct = require("../../controllers/product-admin/deleteProduct.controller");
const toggleTrending = require("../../controllers/product-admin/toggleTrending.controller");

const { protect, adminOnly } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload");

/* CREATE PRODUCT */
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProduct
);

/* GET ALL PRODUCTS */
router.get(
  "/",
  protect,
  adminOnly,
  getAllProducts
);

/* TOGGLE TRENDING */
router.put(
  "/toggle-trending/:id",
  protect,
  adminOnly,
  toggleTrending
);

/* GET SINGLE PRODUCT */
router.get(
  "/:id",
  protect,
  adminOnly,
  getSingleProduct
);

/* UPDATE PRODUCT */
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);

/* DELETE PRODUCT */
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

module.exports = router;