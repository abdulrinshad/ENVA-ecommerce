const Address = require("../../models/address.model");

module.exports = async (req, res) => {
  try {

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ message: "Address deleted" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};