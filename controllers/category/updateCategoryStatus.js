const Category = require("../../models/category.model");

module.exports = async (req, res) => {
  try {
    const { isPublished } = req.body;

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      category
    });

  } catch (error) {
    console.error("UPDATE CATEGORY STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category status"
    });
  }
};