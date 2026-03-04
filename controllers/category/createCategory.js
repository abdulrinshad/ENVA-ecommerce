const Category = require("../../models/category.model");

module.exports = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required"
      });
    }

    const trimmedName = name.trim();

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const exists = await Category.findOne({
      $or: [{ name: trimmedName }, { slug }]
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      image: `/uploads/categories/${req.file.filename}`,
      isPublished: true
    });

    res.status(201).json({
      success: true,
      category
    });

  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};