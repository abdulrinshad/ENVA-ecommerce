const Offer = require("../../models/offer.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const now = new Date();

    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const activeOffers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    /* ===============================
       FIND PRODUCT OFFER
    ============================== */
    const productOffer = activeOffers.find(
      o =>
        o.type === "product" &&
        o.product &&
        o.product.toString() === product._id.toString()
    );

    /* ===============================
       FIND CATEGORY OFFER
    ============================== */
    const categoryOffer =
      product.category &&
      activeOffers.find(
        o =>
          o.type === "category" &&
          o.category &&
          o.category.toString() === product.category._id.toString()
      );

    const appliedOffer = productOffer || categoryOffer;

    let finalPrice = product.price;
    let discountPercent = null;

    if (appliedOffer) {
      if (appliedOffer.discountType === "percentage") {
        discountPercent = appliedOffer.discountValue;

        finalPrice = Math.round(
          product.price - (product.price * discountPercent) / 100
        );

      } else {

        finalPrice = Math.max(
          0,
          product.price - appliedOffer.discountValue
        );

        discountPercent = Math.round(
          (appliedOffer.discountValue / product.price) * 100
        );
      }
    }

    res.json({
      _id: product._id,
      name: product.name,
      description: product.description,
      images: product.images,
      price: product.price,
      finalPrice,
      discountPercent,

      sizes: product.sizes || null,
      stock: product.stock || null
    });

  } catch (error) {
    console.error("SINGLE SHOP PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};