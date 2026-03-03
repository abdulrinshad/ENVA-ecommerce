const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      admin
    });

  } catch (error) {
    console.error("GET ADMIN PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};