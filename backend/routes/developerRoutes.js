const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getDeveloperSummary,
  getSiteDatabase,
  testApiEndpoint,
} = require("../controllers/developerController");

// All developer routes require authentication and website ownership
router.get("/website/:siteId/summary", auth, getDeveloperSummary);
router.get("/website/:siteId/database", auth, getSiteDatabase);
router.post("/website/:siteId/api-test", auth, testApiEndpoint);

module.exports = router;
