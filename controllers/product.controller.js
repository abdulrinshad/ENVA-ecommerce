const Product = require("../models/product.model");

/* =========================================
   CREATE PRODUCT (ADMIN)
========================================= */
exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      price,
      category,
      brand,
      sizes
    } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    /* ===============================
       HANDLE MULTIPLE CATEGORIES
    =============================== */
    if (!Array.isArray(category)) {
      category = [category];
    }

    /* ===============================
       HANDLE IMAGES
    =============================== */
    const images = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    /* ===============================
       PARSE SIZES
    =============================== */
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

    /* ===============================
       CALCULATE TOTAL STOCK
    =============================== */
    let totalStock = 0;

    Object.values(parsedSizes).forEach(qty => {
      totalStock += Number(qty) || 0;
    });

    /* ===============================
       CREATE PRODUCT
    =============================== */
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

/* =========================================
   GET SINGLE PRODUCT (ADMIN)
========================================= */
exports.getProductById = async (req, res) => {
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

/* =========================================
   UPDATE PRODUCT (ADMIN)
========================================= */
exports.updateProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      price,
      category,
      brand,
      sizes
    } = req.body;

    /* ===============================
       HANDLE MULTIPLE CATEGORIES
    =============================== */
    if (category && !Array.isArray(category)) {
      category = [category];
    }

    /* ===============================
       PARSE SIZES
    =============================== */
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

    /* ===============================
       CALCULATE TOTAL STOCK
    =============================== */
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

/* =========================================
   TOGGLE TRENDING
========================================= */
exports.toggleTrending = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.trending = !product.trending;
    await product.save();

    res.json({
      success: true,
      message: "Trending status updated"
    });

  } catch (error) {
    console.error("TRENDING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trending"
    });
  }
};