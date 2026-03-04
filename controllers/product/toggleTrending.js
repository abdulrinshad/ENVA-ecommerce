const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.trending = !product.trending;

    await product.save();

    res.json({
      success: true,
      message: "Trending status updated"
    });

  } catch (error) {

    console.error("TRENDING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update trending"
    });

  }
};