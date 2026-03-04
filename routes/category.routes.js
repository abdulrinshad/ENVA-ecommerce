const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

const categoryController = require("../controllers/category");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/category.upload");

/* =====================================================
   PUBLIC – GET PUBLISHED CATEGORIES (SHOP)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isPublished: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error("GET PUBLIC CATEGORIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.get("/admin", protect,adminOnly, categoryController.getAdminCategories);

router.post("/",protect, adminOnly,upload.single("image"),categoryController.createCategory);

router.put("/:id",protect,adminOnly,categoryController.updateCategoryStatus);

router.delete( "/:id",protect,adminOnly,categoryController.deleteCategory);

module.exports = router;