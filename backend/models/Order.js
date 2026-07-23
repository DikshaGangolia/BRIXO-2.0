const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      default: "",
    },
    items: [
      {
        id: String,
        name: String,
        price: String,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "PENDING (COD)"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "COD"],
      default: "RAZORPAY",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    siteId: {
      type: String,
      default: "default",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
