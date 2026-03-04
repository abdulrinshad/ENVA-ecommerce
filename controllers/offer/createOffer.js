const Offer = require("../../models/offer.model");

module.exports = async (req, res) => {
  try {
    const {
      title,
      type,               // product | category
      product,
      category,
      discountType,
      discountValue,
      startDate,
      endDate
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!title || !type || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (type === "product" && !product) {
      return res.status(400).json({
        success: false,
        message: "Product is required for product offer"
      });
    }

    if (type === "category" && !category) {
      return res.status(400).json({
        success: false,
        message: "Category is required for category offer"
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount must be greater than 0"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    /* ---------- CREATE OFFER ---------- */
    const offer = await Offer.create({
      title,
      type,
      product: type === "product" ? product : null,
      category: type === "category" ? category : null,
      discountType: discountType || "percentage",
      discountValue,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer
    });

  } catch (error) {
    console.error("CREATE OFFER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};