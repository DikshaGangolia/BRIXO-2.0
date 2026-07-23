const express = require("express");
const router = express.Router();
const twilio = require("twilio");

console.log(
  "Route SID:",
  process.env.TWILIO_ACCOUNT_SID ? "Loaded" : "Missing"
);
console.log(
  "Route TOKEN:",
  process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing"
);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post("/send-sms", async (req, res) => {
  try {
    const {
      phone,
      name,
      productName,
      orderId,
      total,
      status,
    } = req.body;
    console.log("PHONE RECEIVED:", phone);
    const message = await client.messages.create({
      body: `🛒 BRIXO

Hi ${name || "Customer"},

Your order has been placed successfully!

Order ID: ${orderId || "ORD-" + Date.now().toString().slice(-6)}
Product: ${productName || "Items"}
Total: ₹${total || "0.10"}
Payment Status: ${status || "PAID"}

Thank you for shopping with BRIXO!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone || "+919528620651",
    });

    res.json({
      success: true,
      sid: message.sid,
    });
  } catch (err) {
    console.error("TWILIO ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;