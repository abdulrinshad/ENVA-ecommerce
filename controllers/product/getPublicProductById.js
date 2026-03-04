const mongoose = require("mongoose");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {

    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};