const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({
      email: email.toLowerCase()
    });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
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
      success: true,
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(401).json({
      success: false,
      message: "Google authentication failed"
    });
  }
};