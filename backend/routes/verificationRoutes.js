const express = require("express");
const router = express.Router();
const {
  sendVerificationCodes,
  validateVerificationCodes,
} = require("../controllers/verificationController");

router.post("/send", sendVerificationCodes);
router.post("/verify", validateVerificationCodes);

module.exports = router;
