const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database Connection Error");
    console.error(error.message);
    process.exit(1);
  }
};
module.exports = connectDB;