const Address = require("../../models/address.model");

module.exports = async (req, res) => {
  try {

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);

  } catch (error) {
    res.status(500).json({ message: "Failed to update address" });
  }
};