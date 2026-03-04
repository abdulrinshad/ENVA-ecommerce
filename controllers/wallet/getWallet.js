const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("wallet");

    // Safety initialization
    if (!user.wallet) {
      user.wallet = { balance: 0, transactions: [] };
      await user.save();
    }

    res.json({
      balance: user.wallet.balance,
      transactions: user.wallet.transactions
    });

  } catch (error) {

    console.error("GET WALLET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load wallet"
    });

  }
};