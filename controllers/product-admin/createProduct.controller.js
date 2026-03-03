const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    let { name, description, price, category, brand, sizes } = req.body;

    if (!Array.isArray(category)) {
      category = [category];
    }

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: "Name, description, price and category are required"
      });
    }

    const images = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    let parsedSizes = {};

    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (err) {
        return res.status(400).json({
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
      price: Number(price),
      category,
      brand: brand || "ENVA",
      images,
      sizes: parsedSizes,
      totalStock,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};