const User = require("../models/User");
const Subscription = require("../models/Subscription");

const premium = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check plan in user document
    const premiumPlans = ["pro", "max", "premium"];
    if (premiumPlans.includes(user.plan)) {
      return next();
    }

    // Also check active subscriptions
    const activeSub = await Subscription.findOne({
      user: user._id,
      status: "active",
      endDate: { $gt: new Date() }
    });

    if (activeSub) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Publish lock active. A premium subscription plan is required to publish websites.",
      publishLocked: true
    });
  } catch (error) {
    console.error("Premium verification middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during premium validation",
    });
  }
};

module.exports = premium;
