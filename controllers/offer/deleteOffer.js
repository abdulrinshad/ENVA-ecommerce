const Offer = require("../../models/offer.model");

module.exports = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Offer deleted successfully"
    });

  } catch (error) {
    console.error("DELETE OFFER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};