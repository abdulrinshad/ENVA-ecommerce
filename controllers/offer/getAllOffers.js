const Offer = require("../../models/offer.model");
const getOfferStatus = require("./utils/getOfferStatus");

module.exports = async (req, res) => {
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
    console.error("GET OFFERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};