const mongoose = require("mongoose");

const checkoutSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: {
      type: Array,
      default: [],
    },
    totalQty: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const checkoutSessionModel = mongoose.model("checkoutSession", checkoutSessionSchema);

module.exports = checkoutSessionModel;
