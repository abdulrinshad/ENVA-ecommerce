const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      qty: { type: Number, default: 1 },
      size: String,
      price: Number
    }
  ],
  coupon: {
    code: String,
    discount: Number
  },
  total: Number,
  finalTotal: Number
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
