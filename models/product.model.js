const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

 category: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
],

  brand: {
    type: String,
    default: "ENVA"
  },

  images: [String],

  // ✅ SIZE BASED INVENTORY
  sizes: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 }
  },

  totalStock: {
    type: Number,
    default: 0
  },

  /* 🔥 ADD THIS TRENDING FIELD */
  trending: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);