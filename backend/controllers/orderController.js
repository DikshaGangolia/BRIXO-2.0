const Order = require("../models/Order");
const Project = require("../models/Project");
const twilio = require("twilio");

// Get all orders for the logged-in shopkeeper
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get order history for a specific customer by user ID or phone
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const phone = req.query.phone;

    let filter = {};
    if (userId) {
      filter.user = userId;
    } else if (phone) {
      filter.customerPhone = phone;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
      error: error.message,
    });
  }
};

// Place a new COD order
exports.placeCodOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalAmount,
      siteId,
    } = req.body;

    if (!customerName || !customerPhone || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details",
      });
    }

    // 1. Find project owner to save User ID
    let projectOwner = null;
    try {
      if (siteId && siteId !== "default" && siteId !== "undefined") {
        const proj = await Project.findById(siteId);
        if (proj) {
          projectOwner = proj.user;
        }
      }
    } catch (err) {
      console.error("Error finding project owner for COD order:", err);
    }

    // 2. Generate unique Order ID
    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Save Order in MongoDB
    const newOrder = await Order.create({
      orderId: generatedOrderId,
      user: projectOwner,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      items,
      totalAmount: parseFloat(totalAmount),
      currency: "INR",
      paymentMethod: "COD",
      paymentStatus: "PENDING (COD)",
      orderStatus: "Pending",
      siteId: siteId || "default",
    });

    // 4. Send Twilio SMS notifications
    let smsSent = false;
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // SMS to Customer
        const customerMsg = `Thank you for your order.\n\nOrder ID: ${generatedOrderId}\nPayment Method: Cash on Delivery\nAmount: ₹${parseFloat(totalAmount).toFixed(2)}\n\nYour order has been confirmed and will be delivered soon.`;
        await client.messages.create({
          body: customerMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: customerPhone,
        });

        // SMS to Shopkeeper
        const shopkeeperPhone = process.env.SHOPKEEPER_PHONE || "+919528620651";
        const shopkeeperMsg = `New COD Order Received.\n\nOrder ID: ${generatedOrderId}\nCustomer: ${customerName}\nAmount: ₹${parseFloat(totalAmount).toFixed(2)}`;
        await client.messages.create({
          body: shopkeeperMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: shopkeeperPhone,
        });

        smsSent = true;
      }
    } catch (smsErr) {
      console.error("Twilio SMS dispatch failed for COD (ignored, order saved):", smsErr.message);
    }

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order: newOrder,
      smsSent,
    });

  } catch (error) {
    console.error("PLACE COD ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error placing COD order",
      error: error.message,
    });
  }
};

// Update order status (Shopkeeper Dashboard action)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const orderId = req.params.id;

    if (!["Pending", "Packed", "Shipped", "Delivered", "Cancelled"].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status value",
      });
    }

    const updateFields = { orderStatus };

    // If order status is set to Delivered, mark payment as PAID (specifically for COD payment method)
    if (orderStatus === "Delivered") {
      const order = await Order.findById(orderId);
      if (order && order.paymentMethod === "COD") {
        updateFields.paymentStatus = "PAID";
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
