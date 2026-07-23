const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createOrder,
  verifyPayment,
  createCartOrder,
  verifyCartPayment,
  getPaymentHistory,
  getSubscriptionStatus,
} = require("../controllers/paymentController");

// General SaaS Plan Payments
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

// Customer Shopping Cart Payments
router.post("/create-cart-order", createCartOrder);
router.post("/verify-cart-payment", verifyCartPayment);

// Authenticated endpoints
router.get("/history", auth, getPaymentHistory);
router.get("/status", auth, getSubscriptionStatus);

module.exports = router;