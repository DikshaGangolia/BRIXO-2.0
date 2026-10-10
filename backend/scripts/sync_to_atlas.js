const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_e) {}

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkAndSync() {
  console.log("=== MONGODB ATLAS CLUSTER0 SYNC CHECK ===");
  let rawUri = process.env.MONGO_URI || "";

  // Strip < > if present in password
  let atlasUri = rawUri.replace(/:<([^>]+)>@/, ":$1@");
  if (!atlasUri.includes("/brixodb") && atlasUri.includes(".mongodb.net")) {
    atlasUri = atlasUri.replace(/\.mongodb\.net\/(\?|$)/, ".mongodb.net/brixodb$1");
  }

  const maskedUri = atlasUri.replace(/:[^:@]+@/, ":***@");
  console.log("Atlas Target URI:", maskedUri);

  console.log("\n1. Testing Atlas connectivity (timeout 5s)...");
  try {
    const atlasConn = await mongoose.createConnection(atlasUri, {
      dbName: "brixodb",
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    console.log(" SUCCESS! Connected to MongoDB Atlas Cluster0!");
    console.log(` Host: ${atlasConn.host}`);
    console.log(` Database: ${atlasConn.name}`);

    // Read local projects from localhost:27017/brixodb
    console.log("\n2. Loading local projects from localhost:27017/brixodb...");
    const localConn = await mongoose.createConnection("mongodb://127.0.0.1:27017/brixodb").asPromise();
    const localProjects = await localConn.db.collection("projects").find({}).toArray();
    const localUsers = await localConn.db.collection("users").find({}).toArray();
    console.log(` Found ${localProjects.length} projects locally.`);

    // Sync to Atlas brixodb
    console.log("\n3. Uploading projects and users to Atlas Cluster0 -> brixodb -> projects...");
    for (const u of localUsers) {
      await atlasConn.db.collection("users").replaceOne({ _id: u._id }, u, { upsert: true });
    }
    for (const p of localProjects) {
      await atlasConn.db.collection("projects").replaceOne({ _id: p._id }, p, { upsert: true });
      await atlasConn.db.collection("project").replaceOne({ _id: p._id }, p, { upsert: true });
      console.log(`  Uploaded project: "${p.title}" (ID: ${p._id})`);
    }

    const atlasCount = await atlasConn.db.collection("projects").countDocuments();
    console.log(`\n SYNC COMPLETE! Total projects in Atlas (brixodb -> projects): ${atlasCount}`);

    await localConn.close();
    await atlasConn.close();
    process.exit(0);

  } catch (err) {
    console.error("\n❌ COULD NOT CONNECT TO ATLAS CLUSTER0:");
    console.error("Reason:", err.message);
    console.log("\n=======================================================");
    console.log("TO FIX THIS IN MONGODB ATLAS:");
    console.log("1. Open https://cloud.mongodb.com/");
    console.log("2. In the left menu under 'SECURITY', click 'Network Access'.");
    console.log("3. Click '+ ADD IP ADDRESS'.");
    console.log("4. Click 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0), then click 'Confirm'.");
    console.log("   MONGO_URI is configured in backend/.env");
    console.log("   MONGO_URI is configured in backend/.env");
    console.log("=======================================================\n");
    process.exit(1);
  }
}

checkAndSync();
