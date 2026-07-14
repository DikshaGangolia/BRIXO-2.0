const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");

const createOrder = async (req, res) => {
  try {
    const { planType, amount: customAmount } = req.body;
    
    let amount = customAmount;
    if (planType === "pro") {
      amount = 499;
    } else if (planType === "max") {
      amount = 999;
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid plan type ('pro' or 'max') or a custom amount",
      });
    }

    const options = {
      amount: amount * 100, // Convert ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, planType } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    // 1. Verify Razorpay signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    // 2. Fetch order details from Razorpay to get the amount paid
    let amountPaid = 0;
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      amountPaid = paymentDetails.amount / 100; // Convert paise back to rupees
    } catch (fetchError) {
      console.error("Failed to fetch payment details, fallback to signature only:", fetchError);
      amountPaid = planType === "max" ? 999 : 499; // Fallback defaults
    }

    // Determine plan type to store
    const targetPlan = (planType === "pro" || planType === "max") ? planType : "pro";

    // 3. Update User Plan in MongoDB
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { plan: targetPlan },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with matching email",
      });
    }

    // 4. Log the transaction in Payments collection
    await Payment.create({
      userEmail: email.toLowerCase(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: amountPaid,
      status: "Success",
    });

    res.status(200).json({
      success: true,
      message: `Payment verified and user successfully upgraded to ${targetPlan} plan`,
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};