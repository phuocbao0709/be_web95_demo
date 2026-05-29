const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: String,
    brandName: String,
    category: String,
    productImage: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number,
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
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
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "failed", "refunded"],
      default: "paid",
    },
    orderStatus: {
      type: String,
      enum: ["paid", "processing", "shipped", "delivered", "cancelled"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  },
);

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
