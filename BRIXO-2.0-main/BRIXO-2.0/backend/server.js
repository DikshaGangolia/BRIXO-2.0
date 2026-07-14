const auth = require("./middleware/authMiddleware");
const projectRoutes = require("./routes/projectRoutes");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
dotenv.config();
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
app.use("/api/projects", auth, projectRoutes);
app.use("/api/public/projects", projectRoutes);
app.get("/", (req, res) => {
  res.send("BRIXO Backend Running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});