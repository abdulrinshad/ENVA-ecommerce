const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["product", "category"],
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    default: "percentage"
  },

  discountValue: {
    type: Number,
    required: true,
    min: 1
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
