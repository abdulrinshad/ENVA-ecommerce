const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile"
    });
  }
};