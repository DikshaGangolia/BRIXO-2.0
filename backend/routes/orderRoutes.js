const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getOrders, getMyOrders, placeCodOrder, updateOrderStatus } = require("../controllers/orderController");

router.get("/", auth, getOrders);
router.get("/my-orders", auth, getMyOrders);
router.post("/place-cod", placeCodOrder);
router.put("/status/:id", auth, updateOrderStatus);

module.exports = router;
