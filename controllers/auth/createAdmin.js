const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin"
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists"
      });
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "admin",
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully"
    });

  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};