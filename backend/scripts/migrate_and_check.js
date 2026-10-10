const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const path = require("path");

async function main() {
  const dbDir = path.resolve(__dirname, "../data/db");
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbDir,
      storageEngine: "wiredTiger",
    },
  });

  const client = await mongoose.connect("mongodb://127.0.0.1:27017/brixo");
  const admin = client.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log("DATABASES FOUND:", dbs.databases.map((d) => d.name));

  const testDb = client.connection.client.db("test");
  const testCols = await testDb.listCollections().toArray();
  console.log("COLLECTIONS IN TEST DB:", testCols.map((c) => c.name));

  for (const col of testCols) {
    const docs = await testDb.collection(col.name).find({}).toArray();
    console.log(`Copying collection "${col.name}" with ${docs.length} document(s) to "brixo" database...`);
    if (docs.length > 0) {
      const brixoCol = client.connection.db.collection(col.name);
      for (const doc of docs) {
        await brixoCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
      }
    }
  }

  const brixoCols = await client.connection.db.listCollections().toArray();
  console.log("COLLECTIONS IN BRIXO DB:", brixoCols.map((c) => c.name));

  const brixoProjects = await client.connection.db.collection("projects").find({}).toArray();
  console.log(`TOTAL PROJECTS IN BRIXO DB: ${brixoProjects.length}`);
  console.log(brixoProjects.map((p) => ({ id: p._id.toString(), title: p.title, user: p.user?.toString() })));

  await client.disconnect();
  await mongod.stop();
  console.log("MIGRATION COMPLETE!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
