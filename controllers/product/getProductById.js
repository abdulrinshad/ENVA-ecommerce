const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {

    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });

  }
};