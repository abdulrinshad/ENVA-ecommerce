const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {

    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    /* =========================
       APPROVE CANCEL
    ========================= */

    item.cancelStatus = "APPROVED";
    item.adminMessage = "Cancellation approved by admin";


    /* =========================
       RESTORE PRODUCT STOCK
    ========================= */

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
       REFUND WALLET (NON COD)
    ========================= */

    if (order.paymentMethod !== "cod") {

      const user = await User.findById(order.user);

      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }

      const refundAmount = item.price * (item.qty || 1);

      user.wallet.balance += refundAmount;

      user.wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for cancelled item: ${item.name}`
      });

      await user.save();
    }


    /* =========================
       UPDATE ORDER STATUS
    ========================= */

    const activeItems = order.items.filter(
      i => i.cancelStatus !== "APPROVED"
    );

    if (activeItems.length === 0) {

      order.status = "Cancelled";

      if (order.paymentMethod !== "cod") {
        order.paymentStatus = "refunded";
      }

    } else {
      order.status = "Partially Cancelled";
    }

    await order.save();

    res.json({
      success: true,
      message: "Cancellation approved"
    });

  } catch (error) {

    console.error("ACCEPT ITEM CANCEL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};