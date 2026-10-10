const mongoose = require("mongoose");

async function main() {
  const conn = await mongoose.connect("mongodb://127.0.0.1:27017");
  const client = conn.connection.client;

  const admin = client.db("admin");
  const dbs = await admin.admin().listDatabases();
  console.log("Databases before migration:", dbs.databases.map(d => d.name));

  const sourceDb = client.db("brixo");
  const targetDb = client.db("brixodb");

  // Get all collections from brixo
  const cols = await sourceDb.listCollections().toArray();
  console.log("Collections to copy from 'brixo' to 'brixodb':", cols.map(c => c.name));

  for (const c of cols) {
    const docs = await sourceDb.collection(c.name).find({}).toArray();
    console.log(`Copying collection "${c.name}" (${docs.length} docs) into 'brixodb'...`);
    const targetCol = targetDb.collection(c.name);
    for (const doc of docs) {
      await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
    }
  }

  // Ensure 'projects' in brixodb has all documents mirrored into 'project' (singular) as well
  const brixodbProjects = await targetDb.collection("projects").find({}).toArray();
  for (const doc of brixodbProjects) {
    await targetDb.collection("project").replaceOne({ _id: doc._id }, doc, { upsert: true });
    await sourceDb.collection("project").replaceOne({ _id: doc._id }, doc, { upsert: true });
    await sourceDb.collection("projects").replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  const updatedDbs = await admin.admin().listDatabases();
  console.log("Databases after migration:", updatedDbs.databases.map(d => d.name));

  const brixodbCols = await targetDb.listCollections().toArray();
  console.log("Collections in brixodb:", brixodbCols.map(c => c.name));

  const countProjectsPlural = await targetDb.collection("projects").countDocuments();
  const countProjectSingular = await targetDb.collection("project").countDocuments();
  console.log(`brixodb -> projects count: ${countProjectsPlural}`);
  console.log(`brixodb -> project count: ${countProjectSingular}`);

  const sample = await targetDb.collection("projects").find({}, { projection: { title: 1, user: 1, updatedAt: 1 } }).toArray();
  console.log("Projects in brixodb -> projects:");
  sample.forEach(p => console.log(" -", p._id.toString(), ":", p.title, `(${p.updatedAt})`));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Migration to brixodb error:", err);
  process.exit(1);
});
