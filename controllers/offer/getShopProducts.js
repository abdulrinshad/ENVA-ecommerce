const Offer = require("../../models/offer.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const now = new Date();
    const categoryFilter = req.query.category;

    const productQuery = {};
    if (categoryFilter) {
      productQuery.category = categoryFilter;
    }

    const products = await Product.find(productQuery)
      .populate("category", "name slug");

    const activeOffers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const result = products.map(product => {

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
        Array.isArray(product.category) &&
        activeOffers.find(
          o =>
            o.type === "category" &&
            o.category &&
            product.category.some(
              cat => cat._id.toString() === o.category.toString()
            )
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

      /* ===============================
         STOCK CALCULATION
      ============================== */

      let hasStock = false;

      if (product.stock !== undefined) {
        hasStock = product.stock > 0;
      }

      if (product.sizes && typeof product.sizes === "object") {
        hasStock = Object.values(product.sizes).some(qty => qty > 0);
      }

      return {
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        finalPrice,
        discountPercent,

        inStock: hasStock,
        stock: product.stock || 0,
        sizes: product.sizes || {},

        category:
          Array.isArray(product.category) && product.category.length > 0
            ? product.category.map(cat => cat.name).join(", ")
            : "Uncategorized"
      };
    });

    res.json(result);

  } catch (error) {
    console.error("SHOP PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};