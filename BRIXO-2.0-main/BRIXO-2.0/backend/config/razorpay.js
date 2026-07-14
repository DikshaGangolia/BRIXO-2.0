const dotenv = require("dotenv");
dotenv.config();
const Razorpay = require("razorpay");
// console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
module.exports = razorpay;