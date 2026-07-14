const express = require("express");
const router = express.Router();
const twilio = require("twilio");
console.log("Route SID:", process.env.TWILIO_ACCOUNT_SID ? "Loaded" : "Missing");
console.log("Route TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post("/send-sms", async (req, res) => {
  try {
    const { phone, productName } = req.body;

    const message = await client.messages.create({
      body: `Thank you for adding "${productName}" to your cart on BRIXO!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({
      success: true,
      sid: message.sid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;