const Category = require("../../models/category.model");

module.exports = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 });

    res.json(categories);

  } catch (error) {
    console.error("GET ADMIN CATEGORIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};