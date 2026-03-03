const Address = require("../../models/address.model");

module.exports = async (req, res) => {
  try {
    const address = await Address.create({
      userId: req.user._id,
      ...req.body
    });

    res.status(201).json({ address });
  } catch (err) {
    console.error("ADDRESS ERROR:", err);
    res.status(500).json({ message: "Failed to save address" });
  }
};