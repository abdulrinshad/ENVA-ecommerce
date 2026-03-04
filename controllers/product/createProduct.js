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

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (!Array.isArray(category)) {
      category = [category];
    }

    const images = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

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

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand: brand || "ENVA",
      images,
      sizes: parsedSizes,
      totalStock,
      createdBy: req.user._id
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct
    });

  } catch (error) {

    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};