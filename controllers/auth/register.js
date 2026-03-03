const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/sendEmail");

module.exports = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Check existing user
    const exists = await User.findOne({
      email: email.toLowerCase(),
      role: "user"
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
      role: "user"
    });

    await sendEmail({
      to: email,
      subject: "ENVA Account Verification",
      html: `<h3>Your OTP: ${otp}</h3>`
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};