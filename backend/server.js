const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const twilioRoutes = require("./routes/twilioRoutes");
const emailRoutes = require("./routes/emailRoutes");
const developerRoutes = require("./routes/developerRoutes");
const auth = require("./middleware/authMiddleware");

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "https://brixo-builder.vercel.app",
  "https://brixo-2-0.onrender.com"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost:") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/developer", developerRoutes);

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