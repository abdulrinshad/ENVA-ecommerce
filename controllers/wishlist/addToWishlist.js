const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Prevent duplicate
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};