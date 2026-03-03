const Address = require("../../models/address.model");

module.exports = async (req, res) => {
  try {
    const addresses = await Address.find({
      userId: req.user._id
    });

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load addresses" });
  }
};