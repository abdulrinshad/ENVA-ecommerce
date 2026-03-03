const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

/* =========================
   PLACE ORDER
========================= */
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const subtotal = cart.total;
    const shipping = 5;
    const total = cart.finalTotal + shipping;

    /* ===== ORDER NUMBER ===== */
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${count + 1}`;

    /* ===== WALLET PAYMENT ===== */
    if (paymentMethod === "wallet") {
      const user = await User.findById(userId);

      if (user.wallet.balance < total) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance"
        });
      }

      user.wallet.balance -= total;
      user.wallet.transactions.push({
        type: "debit",
        amount: total,
        description: "Order purchase"
      });

      await user.save();
    }

    /* ===== REDUCE PRODUCT STOCK ===== */
for (const item of cart.items) {

  const product = await Product.findById(item.product._id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  const size = item.size;
  const orderedQty = item.qty;

  // If you are using sizes (S, M, L...)
  if (product.sizes && size) {

    if (!product.sizes[size] || product.sizes[size] < orderedQty) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for ${product.name} (${size})`
      });
    }

    // 🔥 Reduce stock
    product.sizes[size] -= orderedQty;

  } 
  // If you are using simple stock field
  else if (product.stock !== undefined) {

    if (product.stock < orderedQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items left`
      });
    }

    product.stock -= orderedQty;
  }

  await product.save();
}

    /* ===== CREATE ORDER ===== */
    const order = await Order.create({
      orderNumber,
      user: userId,

      items: cart.items.map(item => ({
  product: item.product._id,
  name: item.product.name,
  price: item.product.price,
  qty: item.qty,
  size: item.size,

  returnStatus: "NONE",
  cancelStatus: "NONE",
  returnedQty: 0,
  requestedReturnQty: 0,
  adminMessage: ""
})),

      subtotal,
      shipping,
      total,
      finalAmount: total,

      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      status: "Placed"
    });

    /* ===== CLEAR CART ===== */
    cart.items = [];
    cart.coupon = null;
    cart.total = 0;
    cart.finalTotal = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order failed"
    });
  }
};

/* =========================
   USER - GET MY ORDERS
========================= */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/* =========================
   USER - GET SINGLE ORDER
========================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("items.product", "images");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

/* =========================
   USER - REQUEST RETURN ITEM
========================= */
exports.requestReturnItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason, returnQty } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const remainingQty = item.qty - item.returnedQty;

    if (returnQty > remainingQty || returnQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid return quantity"
      });
    }

    item.returnStatus = "REQUESTED";
    item.returnReason = reason;
    item.requestedReturnQty = returnQty;

    await order.save();

    res.json({ success: true, message: "Return requested" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Return failed" });
  }
};

/* =========================
   USER - CANCEL ORDER
========================= */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled"
      });
    }

    order.status = "Cancelled";

    if (order.paymentMethod !== "cod" && order.paymentStatus === "paid") {
      const user = await User.findById(req.user.id);

      user.wallet.balance += order.finalAmount;
      user.wallet.transactions.push({
        type: "credit",
        amount: order.finalAmount,
        description: "Order cancellation refund"
      });

      await user.save();
      order.paymentStatus = "refunded";
    }

    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Cancel failed" });
  }
};


/* =========================
   USER - GET MY RETURNS (FIXED)
========================= */
exports.getMyReturns = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      "items.returnStatus": { $ne: "NONE" }
    }).sort({ createdAt: -1 });

    const formattedReturns = [];

    orders.forEach(order => {
      order.items.forEach(item => {

        if (item.returnStatus && item.returnStatus !== "NONE") {

          formattedReturns.push({
            orderId: order._id,
            orderDate: order.createdAt,
            returnStatus: item.returnStatus,

            returnedQty: item.returnedQty || 0,
            orderedQty: item.qty || 0,
            price: item.price || 0,

            adminMessage: item.adminMessage || ""
          });

        }

      });
    });

    res.json({
      success: true,
      returns: formattedReturns
    });

  } catch (err) {
    console.error("GET MY RETURNS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load returns"
    });
  }
};

/* =========================
   USER - GET MY CANCELLATIONS
========================= */
exports.getMyCancellations = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      "items.cancelStatus": { $ne: "NONE" }
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load cancellations" });
  }
};

/* ======================================================
   ADMIN SECTION – FOR TRANSACTIONS PAGE
====================================================== */

/* =========================
   ADMIN - GET ALL ORDERS
========================= */
exports.adminGetOrders = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.paymentStatus = status;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Admin fetch failed" });
  }
};

/* =========================
   ADMIN - TRANSACTION STATS
========================= */
exports.adminGetOrderStats = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const completed = await Order.countDocuments({
      paymentStatus: "paid",
      createdAt: { $gte: last7Days }
    });

    const pending = await Order.countDocuments({
      paymentStatus: "pending",
      createdAt: { $gte: last7Days }
    });

    const failed = await Order.countDocuments({
      paymentStatus: "failed",
      createdAt: { $gte: last7Days }
    });

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } }
    ]);

    res.json({
      success: true,
      totalRevenue: revenueAgg[0]?.total || 0,
      completed,
      pending,
      failed
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
};

/* =========================
   USER - CANCEL SINGLE ITEM
========================= */
exports.requestItemCancel = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

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

    if (item.cancelStatus !== "NONE") {
      return res.status(400).json({
        success: false,
        message: "Cancel already requested"
      });
    }

    item.cancelStatus = "REQUESTED";
    item.adminMessage = "Cancellation requested by user";

    await order.save();

    res.json({
      success: true,
      message: "Item cancellation requested"
    });

  } catch (error) {
    console.error("ITEM CANCEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Cancel failed"
    });
  }
};
