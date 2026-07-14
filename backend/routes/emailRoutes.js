const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/send-email", async (req, res) => {
  try {
    const { email, productName } = req.body;

    await sendEmail(email, productName);

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