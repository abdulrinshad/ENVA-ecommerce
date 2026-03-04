const Category = require("../../models/category.model");

module.exports = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};