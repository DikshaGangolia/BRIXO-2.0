const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/send-email", async (req, res) => {
  try {
    const {
  name,
  email,
  phone,
  address,
  productName,
  orderId,
  total,
} = req.body;

    await sendEmail({
  name,
  email,
  phone,
  address,
  productName,
  orderId,
  total,
});

    res.json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;