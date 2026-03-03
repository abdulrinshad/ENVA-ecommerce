const User = require("../models/user.model");
const Order = require("../models/order.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   CREATE ADMIN
========================= */
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "admin",
      isVerified: true
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   ADMIN LOGIN
========================= */
exports.adminLogin = async (req, res) => {
  try {
    console.log("Login Body:", req.body);

    const { email, password } = req.body;

    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin"
    });

    console.log("Found Admin:", admin);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   USER REGISTER (OTP)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false
    });

    await sendEmail({
      to: email,
      subject: "ENVA Account Verification",
      html: `<h3>Your OTP: ${otp}</h3>`
    });

    res.status(201).json({ message: "OTP sent to email" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   VERIFY SIGNUP OTP
========================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, role: "user" });

    if (
      !user ||
      user.otp !== String(otp) ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   USER LOGIN
========================= */
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "user" });
    if (!user || !user.isVerified) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    res.json({ message: "Password reset OTP sent" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   USER - GET PROFILE
========================= */
exports.getUserProfile = async (req, res) => {
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
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile"
    });
  }
};

/* =========================
   VERIFY RESET OTP
========================= */
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== String(otp) ||
      user.resetOtpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GOOGLE SIGNUP / LOGIN
========================= */
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    // Create new user if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "GOOGLE_AUTH",
        isVerified: true,
        role: "user"
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

/* =========================
   CANCEL ORDER (USER)
========================= */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
  _id: req.params.id,
  user: req.user._id,  // ✅ FIXED
  status: "Placed"
});


    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled"
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Cancel failed"
    });
  }
};


/* =========================
   RETURN ORDER (USER)
========================= */
exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
  _id: req.params.id,
  user: req.user._id,  // ✅ FIXED
  status: "Delivered"
});


    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be returned"
      });
    }

    order.status = "Returned";
    await order.save();

    res.json({
      success: true,
      message: "Return requested successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Return failed"
    });
  }
};

/* =========================
   GET ADMIN PROFILE
========================= */
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(admin);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
/* =========================
   ADMIN CHANGE PASSWORD
========================= */
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    // Hash new password
    admin.password = await bcrypt.hash(newPassword, 10);

    await admin.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
