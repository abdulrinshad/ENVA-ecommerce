const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};