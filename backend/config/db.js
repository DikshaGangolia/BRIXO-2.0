const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_e) {}

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== "") {
    try {
      // Auto-sanitize: remove accidental angle brackets from password
      mongoUri = mongoUri.replace(/:<([^>]+)>@/, ":$1@");
      if (!mongoUri.includes("/brixodb") && mongoUri.includes(".mongodb.net")) {
        mongoUri = mongoUri.replace(/\.mongodb\.net\/(\?|$)/, ".mongodb.net/brixodb$1");
      }

      console.log("Connecting to MongoDB via MONGO_URI...");
      const conn = await mongoose.connect(mongoUri, {
        dbName: "brixodb",
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (error) {
      console.warn("Could not connect to external MONGO_URI:", error.message);
      console.warn("Falling back to local persistent MongoDB server on port 27017 for brixodb database...");
    }
  }

  // Fallback to MongoMemoryServer with persistent on-disk storage on standard port 27017
  try {
    const path = require("path");
    const fs = require("fs");
    const { MongoMemoryServer } = require("mongodb-memory-server");

    const dbDir = path.resolve(__dirname, "../data/db");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    let mongod;
    try {
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath: dbDir,
          dbName: "brixodb",
          storageEngine: "wiredTiger",
        },
      });
    } catch (portErr) {
      console.warn("Port 27017 busy, using available port:", portErr.message);
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          dbName: "brixodb",
          storageEngine: "wiredTiger",
        }, 
      });
    }

    const baseUri = mongod.getUri();
    const uri = baseUri.endsWith("/") ? `${baseUri}brixodb` : `${baseUri}/brixodb`;
    const conn = await mongoose.connect(uri);
    console.log(`Persistent MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name} (${uri}) [Data stored in ${dbDir}]`);
  } catch (memError) {
    console.error("Failed to start persistent MongoDB:", memError.message);
    process.exit(1);
  }
};

module.exports = connectDB;