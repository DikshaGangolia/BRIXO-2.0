const dotenv = require("dotenv");
dotenv.config();
const Razorpay = require("razorpay");
// console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "pBbFV85kZaigXI1u4BCfHF0x",
});
module.exports = razorpay;