const mongoose = require("mongoose");

/* =========================
   ORDER ITEM SCHEMA
========================= */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    qty: {
      type: Number,
      required: true
    },

    returnedQty: {
      type: Number,
      default: 0
    },

    size: String,

    /* ===== RETURN ===== */
    returnStatus: {
      type: String,
      enum: ["NONE", "REQUESTED", "APPROVED", "DECLINED", "RETURNED"],
      default: "NONE"
    },

    returnReason: String,

    /* ===== CANCEL ===== */
    cancelStatus: {
      type: String,
      enum: ["NONE", "REQUESTED", "APPROVED", "DECLINED"],
      default: "NONE"
    },

    /* ===== ADMIN MESSAGE ===== */
    adminMessage: String
  },
  { _id: true }
);

/* =========================
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {
    /* ===== ORDER IDENTIFIER ===== */
    orderNumber: {
      type: String,
      unique: true
    },

    /* ===== USER ===== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ===== ITEMS ===== */
    items: [orderItemSchema],

    /* ===== PRICE BREAKUP ===== */
    subtotal: {
      type: Number,
      required: true
    },

    shipping: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      required: true
    },

    /* ===== FINAL AMOUNT (USED IN TRANSACTIONS) ===== */
    finalAmount: {
      type: Number,
      required: true
    },

    /* ===== PAYMENT ===== */
    paymentMethod: {
      type: String,
      enum: ["wallet", "razorpay", "cod"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    paymentId: {
      type: String
    },

    /* ===== ORDER STATUS ===== */
    status: {
      type: String,
      enum: [
        "Placed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
        "Partially Returned"
      ],
      default: "Placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
