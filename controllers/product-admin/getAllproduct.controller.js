const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    const updatedProducts = products.map(product => {
      const sizes = product.sizes || {};

      const totalStock =
        (sizes.S || 0) +
        (sizes.M || 0) +
        (sizes.L || 0) +
        (sizes.XL || 0) +
        (sizes.XXL || 0);

      let stockStatus = "In Stock";

      if (totalStock === 0) {
        stockStatus = "Out of Stock";
      } else if (totalStock <= 5) {
        stockStatus = "Low Stock";
      }

      return {
        ...product._doc,
        stock: totalStock,
        stockStatus
      };
    });

    res.json(updatedProducts);

  } catch (error) {
    console.error("GET ALL PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};