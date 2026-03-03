const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};