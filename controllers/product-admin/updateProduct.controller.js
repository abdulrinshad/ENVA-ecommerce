const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let { name, description, price, category, brand, sizes, isActive } = req.body;

    // Fix category array
    if (category && !Array.isArray(category)) {
      category = [category];
    }

    // Parse sizes (if coming as JSON string)
    let parsedSizes = product.sizes;

    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid sizes format"
        });
      }
    }

    // Recalculate totalStock
    let totalStock = 0;
    Object.values(parsedSizes).forEach(qty => {
      totalStock += Number(qty) || 0;
    });

    // Update fields
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.sizes = parsedSizes;
    product.totalStock = totalStock;
    product.isActive = isActive ?? product.isActive;

    // Replace images only if new uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    await product.save();

    res.json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};