const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

const {
  getAdminCategories,
  createCategory,
  updateCategoryStatus,
  deleteCategory
} = require("../controllers/category.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/category.upload"); // 🔥 ADD THIS

/* =====================================================
   PUBLIC – GET PUBLISHED CATEGORIES (SHOP)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isPublished: true })
      .sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    console.error("GET PUBLIC CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN ROUTES
===================================================== */
router.get("/admin", protect, adminOnly, getAdminCategories);

// 🔥 IMAGE UPLOAD ENABLED HERE
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createCategory
);

router.put("/:id", protect, adminOnly, updateCategoryStatus);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
