const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: String,

    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true
    },

    value: {
      type: Number,
      required: true
    },

    minSpend: {
      type: Number,
      default: 0
    },

    maxUses: {
      type: Number,
      default: 0 // 0 = unlimited
    },

    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    oneTime: {
      type: Boolean,
      default: false
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
