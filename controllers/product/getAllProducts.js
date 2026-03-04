const mongoose = require("mongoose");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const { category } = req.query;

    const filter = { isActive: true };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (error) {

    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};