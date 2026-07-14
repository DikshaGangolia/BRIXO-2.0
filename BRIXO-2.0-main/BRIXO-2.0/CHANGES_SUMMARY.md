# BRIXO 2.0 - Razorpay & Multi-Tier Plans Integration Summary

This file documents all the modifications and additions made to integrate Razorpay payment gateway, database sync with MongoDB, and the frontend three-tier pricing model (**Normal**, **Pro**, and **Max**).

---

## 1. Database & Models (Backend)

### [NEW] [Payment.js](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/backend/models/Payment.js)
Created a schema to audit successful transactions in MongoDB:
```javascript
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, trim: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "Success" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
```

### [MODIFY] [User.js](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/backend/models/User.js)
Modified the plan field to support the standard, pro, and max tiers:
```diff
     plan: {
       type: String,
-      enum: ["free", "premium"],
-      default: "free",
+      enum: ["free", "premium", "normal", "pro", "max"],
+      default: "normal",
     },
```

---

## 2. API Routes & Controllers (Backend)

### [MODIFY] [paymentController.js](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/backend/controllers/paymentController.js)
Rewrote the payment controller to validate tiers, resolve prices dynamically, and verify signatures:
* **Order Creation**: Maps `planType` to prices (Pro = ₹499, Max = ₹999) and retrieves Razorpay Key ID dynamically.
* **Signature Verification**: Verifies the signature using HMAC SHA256 and updates user accounts to the purchased tier in MongoDB:
```javascript
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");

// Create Razorpay Order
const createOrder = async (req, res) => {
  try {
    const { planType, amount: customAmount } = req.body;
    let amount = customAmount;
    if (planType === "pro") amount = 499;
    else if (planType === "max") amount = 999;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Invalid plan or amount" });
    }

    const options = { amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, planType } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    const targetPlan = (planType === "pro" || planType === "max") ? planType : "pro";
    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { plan: targetPlan }, { new: true });

    await Payment.create({
      userEmail: email.toLowerCase(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: planType === "max" ? 999 : 499,
      status: "Success",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification error" });
  }
};
```

### [MODIFY] [paymentRoutes.js](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/backend/routes/paymentRoutes.js)
Added `/verify-payment` route:
```diff
-const { createOrder } = require("../controllers/paymentController");
+const { createOrder, verifyPayment } = require("../controllers/paymentController");

 router.post("/create-order", createOrder);
+router.post("/verify-payment", verifyPayment);
```

---

## 3. Types & Store Actions (Frontend)

### [MODIFY] [builder.ts](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/BRIXO-2.0-main/src/types/builder.ts)
Extended UserSession interface to store user's current subscription level:
```typescript
export interface UserSession {
  email: string;
  isLoggedIn: boolean;
  name?: string;
  plan?: string; // 'free' | 'premium' | 'normal' | 'pro' | 'max'
}
```

### [MODIFY] [useAuthStore.ts](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/BRIXO-2.0-main/src/store/useAuthStore.ts)
Modified login/signup store actions to dynamically write user plan variables into the store session state:
```typescript
    const session = {
      email: user.email,
      isLoggedIn: true,
      name: user.name,
      plan: user.plan || 'free'
    };
```

---

## 4. User Dashboard & Billing UI (Frontend)

### [MODIFY] [Dashboard.tsx](file:///c:/Users/shiva/OneDrive/Desktop/BRIXO_delet/BRIXO-2.0-main/BRIXO-2.0-main/src/components/dashboard/Dashboard.tsx)
* **Left Sidebar Widget**: Displays current tier badge ("Normal" / "Pro" / "Max") with HSL themes. Relinks the button to trigger a Plans comparison.
* **handlePayment(planType)**: Calls backend API and opens Razorpay checkout dynamically matching the selected tier (Pro / Max).
* **Comparative Modal Overlay**: Created a beautiful plans selection table outlining tier benefits:
  * **Normal** (₹0): 1 website, standard customization.
  * **Pro** (₹499): 5 websites, premium presets, and source ZIP download features.
  * **Max** (₹999): Unlimited websites, custom domain integrations, and 24/7 priority support lines.
Test commit