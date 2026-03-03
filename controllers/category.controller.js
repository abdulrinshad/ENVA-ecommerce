const Category = require("../models/category.model");

/* =====================================================
   GET ALL CATEGORIES (ADMIN)
===================================================== */
exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/* =====================================================
   CREATE CATEGORY (ADMIN)
===================================================== */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Category image is required" });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const exists = await Category.findOne({
      $or: [{ name: name.trim() }, { slug }]
    });

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      image: `/uploads/categories/${req.file.filename}`, // ✅ FIXED
      isPublished: true
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   UPDATE CATEGORY STATUS
===================================================== */
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { isPublished } = req.body;

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category status" });
  }
};

/* =====================================================
   DELETE CATEGORY
===================================================== */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};
