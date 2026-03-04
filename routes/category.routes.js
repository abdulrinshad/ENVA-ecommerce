const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/category.upload");

/* =====================================================
   PUBLIC – GET PUBLISHED CATEGORIES (SHOP)
===================================================== */

router.get("/", categoryController.getPublicCategories);


/* =====================================================
   ADMIN ROUTES
===================================================== */

/* ADMIN – GET ALL CATEGORIES */
router.get(
  "/admin",
  protect,
  adminOnly,
  categoryController.getAdminCategories
);

/* ADMIN – CREATE CATEGORY */
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  categoryController.createCategory
);

/* ADMIN – UPDATE CATEGORY STATUS */
router.put(
  "/:id",
  protect,
  adminOnly,
  categoryController.updateCategoryStatus
);

/* ADMIN – DELETE CATEGORY */
router.delete(
  "/:id",
  protect,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;