const Category = require("../../models/category.model");

module.exports = async (req, res) => {
  try {

    const categories = await Category.find({ isPublished: true })
      .sort({ createdAt: -1 });

    res.json(categories);

  } catch (error) {

    console.error("GET PUBLIC CATEGORIES ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};