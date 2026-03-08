const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Product = require("../../models/product.model");

module.exports = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { approvedQty } = req.body;

    if (!approvedQty || approvedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid approved quantity"
      });
    }

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

    const remainingQty = item.qty - (item.returnedQty || 0);

    if (approvedQty > remainingQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingQty} item(s) can be approved`
      });
    }

    /* =========================
       UPDATE ITEM
    ========================= */
    item.returnedQty = (item.returnedQty || 0) + approvedQty;
    item.returnCompletedAt = new Date();
    item.adminMessage = `Return approved for ${approvedQty} qty`;

    item.returnStatus =
      item.returnedQty === item.qty ? "RETURNED" : "APPROVED";


    /* =========================
       RESTORE PRODUCT STOCK
    ========================= */

    const product = await Product.findById(item.product);

    if (product) {

      if (item.size && product.sizes[item.size] !== undefined) {
        product.sizes[item.size] += approvedQty;
      }

      product.totalStock += approvedQty;

      await product.save();
    }


    /* =========================
       AUTO REFUND (NON-COD)
    ========================= */

    if (order.paymentMethod !== "cod") {

      const user = await User.findById(order.user);

      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }

      const refundAmount = item.price * approvedQty;

      user.wallet.balance += refundAmount;

      user.wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for ${approvedQty} × ${item.name}`
      });

      await user.save();
    }


    /* =========================
       ORDER STATUS
    ========================= */

    const allReturned = order.items.every(
      i => (i.returnedQty || 0) === i.qty
    );

    if (allReturned) {

      order.status = "Returned";

      if (order.paymentMethod !== "cod") {
        order.paymentStatus = "refunded";
      }

    } else {

      order.status = "Partially Returned";

    }

    await order.save();

    res.json({
      success: true,
      message: "Return approved, stock restored & refund processed"
    });

  } catch (error) {

    console.error("ACCEPT ITEM RETURN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};