const User = require("../../models/user.model");
const sendEmail = require("../../utils/sendEmail");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "ENVA Password Reset OTP",
      html: `<h3>Your OTP: ${otp}</h3>`
    });

    res.json({
      success: true,
      message: "Password reset OTP sent"
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};