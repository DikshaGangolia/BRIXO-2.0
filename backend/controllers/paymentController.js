const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const twilio = require("twilio");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const Order = require("../models/Order");

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

    // 5. Create or update active Subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 days subscription

    await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        planType: targetPlan,
        status: "active",
        startDate,
        endDate,
      },
      { upsert: true, new: true }
    );

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

// Create Razorpay Order specifically for customer shopping cart items
const createCartOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // Convert INR rupees to paise (e.g., 0.10 * 100 = 10 paise)
    const amountInPaise = Math.round(numAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Cart order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create cart Razorpay order: " + error.message,
    });
  }
};

// Verify payment for shopping cart items, persist Order in MongoDB, & dispatch Twilio SMS
const verifyCartPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalAmount,
      siteId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // 2. Generate unique Order ID
    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Find project owner to save User ID
    let projectOwner = null;
    try {
      if (siteId && siteId !== "default" && siteId !== "undefined") {
        const Project = require("../models/Project");
        const proj = await Project.findById(siteId);
        if (proj) {
          projectOwner = proj.user;
        }
      }
    } catch (err) {
      console.error("Error finding project owner:", err);
    }

    // 4. Save Order in MongoDB
    const newOrder = await Order.create({
      orderId: generatedOrderId,
      user: projectOwner,
      customerName: customerName || "Valued Customer",
      customerPhone: customerPhone || "+919528620651",
      customerEmail: customerEmail || "",
      items: items || [],
      totalAmount: parseFloat(totalAmount) || 0.1,
      currency: "INR",
      paymentStatus: "PAID",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      siteId: siteId || "default",
    });

    // 4. Send SMS via Twilio using existing service
    let smsSent = false;
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        const itemNames = (items || []).map(i => i.name).join(", ") || "Selected items";
        const messageBody = `🛒 BRIXO

Hi ${customerName || "Customer"},

Your payment was successful and order has been placed!

Order ID: ${generatedOrderId}
Product(s): ${itemNames}
Amount Paid: ₹${parseFloat(totalAmount || 0.1).toFixed(2)}
Payment Status: PAID

Thank you for shopping with BRIXO!`;

        await client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: customerPhone || "+919528620651",
        });
        smsSent = true;
      }
    } catch (smsErr) {
      console.error("Twilio SMS dispatch failed (ignored, order saved):", smsErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified, order saved in MongoDB, and cart cleared",
      order: newOrder,
      smsSent,
    });
  } catch (error) {
    console.error("Cart payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error verifying cart payment: " + error.message,
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const payments = await Payment.find({ userEmail: user.email.toLowerCase() }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching payment history",
    });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subscription = await Subscription.findOne({ user: user._id });
    res.status(200).json({
      success: true,
      plan: user.plan,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching subscription status",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  createCartOrder,
  verifyCartPayment,
  getPaymentHistory,
  getSubscriptionStatus,
};