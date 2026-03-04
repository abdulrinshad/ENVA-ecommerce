const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.productId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};