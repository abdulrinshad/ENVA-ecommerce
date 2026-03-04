const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const products = await Product.find({
      trending: true,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(products);

  } catch (error) {

    console.error("GET TRENDING ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};