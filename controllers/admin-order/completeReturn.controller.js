const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("user");

    if (!order || !order.returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    if (order.returnRequest.status !== "PICKUP_SCHEDULED") {
      return res.status(400).json({
        success: false,
        message: "Return not ready to complete"
      });
    }

    /* =========================
       UPDATE RETURN STATUS
    ========================= */
    order.returnRequest.status = "RETURN_SUCCESSFUL";
    order.returnRequest.completedAt = new Date();


    /* =========================
   RESTORE PRODUCT STOCK
========================= */

const product = await Product.findById(item.product);

if (product) {

  if (item.size && product.sizes[item.size] !== undefined) {

    product.sizes[item.size] += item.qty;

  }

  product.totalStock += item.qty;

  await product.save();
}


    /* =========================
       REFUND PREPAID ORDERS
    ========================= */

    if (order.paymentMethod !== "cod" && order.paymentStatus === "paid") {

      const user = await User.findById(order.user._id);

      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }

      let refundAmount = 0;

      for (const item of order.items) {
        if (item.returnStatus === "RETURNED") {
          refundAmount += item.price * (item.returnedQty || item.qty);
        }
      }

      user.wallet.balance += refundAmount;

      user.wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: "Refund for returned items"
      });

      await user.save();

      order.paymentStatus = "refunded";
    }

    await order.save();

    res.json({
      success: true,
      message: "Return completed successfully"
    });

  } catch (error) {

    console.error("COMPLETE RETURN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};