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

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token && !sid.includes("dummy") && !sid.includes("your_")) {
    try {
      return twilio(sid, token);
    } catch (e) {
      return null;
    }
  }
  return null;
};

router.post("/send-sms", async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return res.status(200).json({
        success: true,
        message: "Twilio credentials not configured; SMS notification skipped in development mode."
      });
    }
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
      to: phone || "+911234567890",
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