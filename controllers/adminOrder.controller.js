const Order = require("../models/order.model");
const User = require("../models/user.model");

/* =========================
   GET ALL ORDERS (ADMIN)
========================= */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        // 🔑 IDENTIFIERS
        orderNumber: order.orderNumber,   // STRING (important)
        customerId: order.user?._id || null,

        // 👤 CUSTOMER
        customerName: order.user?.name || "Guest",

        // 📅 DATE
        createdAt: order.createdAt,

        // 💰 AMOUNT
        finalAmount: order.finalAmount,   // ✅ EXISTS in model

        // 💳 PAYMENT
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,

        // 📦 ORDER STATUS (optional for table)
        status: order.status
      }))
    });
  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};


/* =========================
   UPDATE ORDER STATUS (ADMIN)
========================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;

    // mark delivery time
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      status: order.status
    });

  } catch (error) {
    console.error("ADMIN UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};

exports.acceptItemReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { approvedQty } = req.body; // 👈 VERY IMPORTANT

    if (!approvedQty || approvedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid approved quantity"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const remainingQty = item.qty - (item.returnedQty || 0);

    if (approvedQty > remainingQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingQty} item(s) can be approved`
      });
    }

    /* =========================
       UPDATE ITEM (PER QTY)
    ========================= */
    item.returnedQty = (item.returnedQty || 0) + approvedQty;
    item.returnCompletedAt = new Date();
    item.adminMessage = `Return approved for ${approvedQty} qty`;

    if (item.returnedQty === item.qty) {
      item.returnStatus = "RETURNED";
    } else {
      item.returnStatus = "APPROVED";
    }

    /* =========================
       AUTO REFUND (NON-COD)
    ========================= */
    if (order.paymentMethod !== "cod") {
      const user = await User.findById(order.user);

      if (!user.wallet) {
        user.wallet = { balance: 0, transactions: [] };
      }

      const refundAmount = item.price * approvedQty; // ✅ FIX

      user.wallet.balance += refundAmount;
      user.wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for ${approvedQty} × ${item.name}`
      });

      await user.save();
    }

    /* =========================
       ORDER STATUS FIX
    ========================= */
    const allReturned = order.items.every(
  i => (i.returnedQty || 0) === i.qty
);

if (allReturned) {
  order.status = "Returned";

  // ✅ Only mark refunded if prepaid
  if (order.paymentMethod !== "cod") {
    order.paymentStatus = "refunded";
  }

} else {
  order.status = "Partially Returned";
}

await order.save();

res.json({
  success: true,
  message: "Return approved & refund processed"
});

  } catch (error) {
    console.error("ACCEPT ITEM RETURN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.declineItemReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.returnStatus = "NONE";
    item.adminMessage =
      "Your return request was declined. Please contact support for more details.";

    await order.save();

    res.json({
      success: true,
      message: "Return declined for this item"
    });

  } catch (error) {
    console.error("DECLINE ITEM RETURN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   SCHEDULE RETURN PICKUP
========================= */
exports.schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pickupDate } = req.body;

    const order = await Order.findById(orderId);

    if (!order || !order.returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found"
      });
    }

    if (order.returnRequest.status !== "RETURN_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: "Pickup already scheduled or completed"
      });
    }

    order.returnRequest.status = "PICKUP_SCHEDULED";
    order.returnRequest.pickupDate = pickupDate;

    await order.save();

    res.json({
      success: true,
      message: "Pickup scheduled"
    });

  } catch (error) {
    console.error("SCHEDULE PICKUP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule pickup"
    });
  }
};

/* =========================
   COMPLETE RETURN
========================= */
exports.completeReturn = async (req, res) => {
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

    order.returnRequest.status = "RETURN_SUCCESSFUL";
    order.returnRequest.completedAt = new Date();

    // refund prepaid orders
    if (order.paymentMethod !== "cod" && order.paymentStatus === "paid") {
      const user = await User.findById(order.user._id);

      user.wallet.balance += order.total;
      user.wallet.transactions.push({
        type: "credit",
        amount: order.total,
      
        description: "Return refund"
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
      message: "Failed to complete return"
    });
  }
};
/* =========================
   ACCEPT ITEM CANCEL
========================= */
exports.acceptItemCancel = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.cancelStatus = "APPROVED";
    item.adminMessage = "Cancellation approved by admin";

    /* =========================
       AUTO REFUND
    ========================= */
    if (order.paymentMethod !== "cod") {
  const user = await User.findById(order.user);

  // 🔐 SAFETY INIT
  if (!user.wallet) {
    user.wallet = { balance: 0, transactions: [] };
  }

  const refundAmount = item.price * item.qty;

  user.wallet.balance += refundAmount;
  user.wallet.transactions.push({
    type: "credit",
    amount: refundAmount,
    description: `Refund for ${item.name}`
  });

  await user.save();
}


    /* =========================
       ORDER STATUS
    ========================= */
    const activeItems = order.items.filter(
  i => i.cancelStatus !== "APPROVED"
);

if (activeItems.length === 0) {
  order.status = "Cancelled";
  order.paymentStatus = "refunded";
}


    await order.save();

    res.json({
      success: true,
      message: "Cancellation approved"
    });

  } catch (error) {
    console.error("ACCEPT ITEM CANCEL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   DECLINE ITEM CANCEL
========================= */
exports.declineItemCancel = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { message } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.cancelStatus = "DECLINED";
    item.adminMessage = message || "Cancellation declined by admin";

    await order.save();

    res.json({ success: true });

  } catch (err) {
    console.error("DECLINE CANCEL ERROR:", err);
    res.status(500).json({ success: false });
  }
};
exports.getOrdersForManagement = async (req, res) => {
  try {
    const {
      status,
      search,
      paymentStatus,
      date,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};
    const skip = (page - 1) * limit;

    /* =========================
       STATUS FILTER
    ========================= */
    if (status) {
      filter.status = status;
    }

    /* =========================
       PAYMENT FILTER
    ========================= */
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    /* =========================
       DATE FILTER
    ========================= */
    if (date) {
      const now = new Date();
      let startDate;

      if (date === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      }

      if (date === "7days") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      }

      if (date === "1month") {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
      }

      if (date === "1year") {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    /* =========================
       SEARCH FILTER
    ========================= */
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } }
      ];
    }

    /* =========================
       TOTAL COUNT
    ========================= */
    const totalOrders = await Order.countDocuments(filter);

    /* =========================
       FETCH ORDERS
    ========================= */
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page)
    });

  } catch (error) {
    console.error("ADMIN ORDER MANAGEMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};