const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
    },
    razorpaySignature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
