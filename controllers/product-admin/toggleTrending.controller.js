const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    product.trending = !product.trending;
    await product.save();

    res.json({
      message: "Trending status updated",
      trending: product.trending
    });

  } catch (error) {
    console.error("TOGGLE TRENDING ERROR:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};