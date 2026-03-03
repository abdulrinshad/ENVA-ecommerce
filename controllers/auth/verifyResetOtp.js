const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (
      !user ||
      user.resetOtp !== String(otp) ||
      !user.resetOtpExpiry ||
      user.resetOtpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};