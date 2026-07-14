
require("dotenv").config();
const emailRoutes = require("./routes/emailRoutes");
const auth = require("./middleware/authMiddleware");
const projectRoutes = require("./routes/projectRoutes");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const twilioRoutes = require("./routes/twilioRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
console.log("TWILIO SID:", process.env.TWILIO_ACCOUNT_SID ? "Loaded" : "Missing");
console.log("TWILIO TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing");
console.log("TWILIO PHONE:", process.env.TWILIO_PHONE_NUMBER);
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/email", emailRoutes);
// Public routes (no auth required) — must come BEFORE authenticated routes
app.use("/api/public/projects", projectRoutes);
// Authenticated routes
app.use("/api/projects", auth, projectRoutes);
app.get("/", (req, res) => {
  res.send("BRIXO Backend Running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});