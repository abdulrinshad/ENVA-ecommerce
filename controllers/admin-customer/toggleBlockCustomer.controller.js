const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      isBlocked: user.isBlocked
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};