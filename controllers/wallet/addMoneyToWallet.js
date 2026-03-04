const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const user = await User.findById(req.user.id);

    // Safety initialization
    if (!user.wallet) {
      user.wallet = { balance: 0, transactions: [] };
    }

    user.wallet.balance += Number(amount);

    user.wallet.transactions.push({
      type: "credit",
      amount: Number(amount),
      description: "Wallet Top-up",
      createdAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      balance: user.wallet.balance,
      transactions: user.wallet.transactions
    });

  } catch (error) {

    console.error("ADD WALLET MONEY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add money"
    });

  }
};