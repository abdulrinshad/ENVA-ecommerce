const Offer = require("../models/offer.model");
const Product = require("../models/product.model");

/* ======================================================
   UTIL: GET OFFER STATUS
====================================================== */
const getOfferStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < startDate) return "Upcoming";
  if (now > endDate) return "Expired";
  return "Active";
};

/* ======================================================
   ADMIN: CREATE OFFER
====================================================== */
exports.createOffer = async (req, res) => {
  try {
    const {
      title,
      type,               // product | category
      product,            // productId
      category,           // categoryId
      discountType,       // percentage | flat
      discountValue,
      startDate,
      endDate
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!title || !type || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "product" && !product) {
      return res.status(400).json({ message: "Product is required for product offer" });
    }

    if (type === "category" && !category) {
      return res.status(400).json({ message: "Category is required for category offer" });
    }

    if (discountValue <= 0) {
      return res.status(400).json({ message: "Discount must be greater than 0" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
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
      message: "Offer created successfully",
      offer
    });

  } catch (error) {
    console.error("Create Offer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: GET ALL OFFERS (TABLE VIEW)
====================================================== */
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("product", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const formatted = offers.map(offer => ({
      _id: offer._id,
      title: offer.title,
      target: offer.product?.name || offer.category?.name || "-",
      discount:
        offer.discountType === "percentage"
          ? `${offer.discountValue}% OFF`
          : `₹${offer.discountValue}`,
      status: getOfferStatus(offer.startDate, offer.endDate),
      startDate: offer.startDate,
      endDate: offer.endDate
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Get Offers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getShopProducts = async (req, res) => {
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
         🔥 STOCK CALCULATION FIX
      ============================== */

      let hasStock = false;

      // If using simple stock field
      if (product.stock !== undefined) {
        hasStock = product.stock > 0;
      }

      // If using size-based stock
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

        // 🔥 IMPORTANT ADDITIONS
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
    console.error("Shop Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ======================================================
   GET SINGLE PRODUCT WITH OFFER
====================================================== */
exports.getSingleShopProduct = async (req, res) => {
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
          product.price -
          (product.price * discountPercent) / 100
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

  // ✅ ADD THESE
  sizes: product.sizes || null,
  stock: product.stock || null
});

  } catch (error) {
    console.error("Single Shop Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/* ======================================================
   ADMIN: DELETE OFFER
====================================================== */
exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
