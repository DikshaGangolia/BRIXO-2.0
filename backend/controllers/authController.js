const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cleanName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "brixo_jwt_secret_dev_key_987654",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and Password are required",
      });
    }

    const cleanInput = String(email).trim();
    const normalizedEmail = cleanInput.toLowerCase();

    // Find by normalized email OR by name/username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { name: cleanInput },
        { name: { $regex: new RegExp(`^${cleanInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") } }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "brixo_jwt_secret_dev_key_987654",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


module.exports = {
  register,
  login,
};