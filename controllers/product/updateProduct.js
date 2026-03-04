const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    let {
      name,
      description,
      price,
      category,
      brand,
      sizes
    } = req.body;

    if (category && !Array.isArray(category)) {
      category = [category];
    }

    let parsedSizes = {};

    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid sizes format"
        });
      }
    }

    let totalStock = 0;

    Object.values(parsedSizes).forEach(qty => {
      totalStock += Number(qty) || 0;
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        brand,
        sizes: parsedSizes,
        totalStock
      },
      { new: true }
    ).populate("category", "name slug");

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {

    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });

  }
};