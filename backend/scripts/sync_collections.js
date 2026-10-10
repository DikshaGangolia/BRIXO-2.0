const mongoose = require("mongoose");

async function sync() {
  const conn = await mongoose.connect("mongodb://127.0.0.1:27017/brixo");
  const db = conn.connection.db;

  const usersCol = db.collection("users");
  const projectsCol = db.collection("projects");
  const projectSingularCol = db.collection("project");

  // Find Diksha or first user
  const diksha = await usersCol.findOne({ email: "diksam2710@gmail.com" });
  const defaultUserId = diksha ? diksha._id : (await usersCol.findOne({}))?._id;
  console.log("Using default user ID for ownership:", defaultUserId.toString());

  // 1. Get all projects in projects collection
  let projects = await projectsCol.find({}).toArray();
  console.log(`Found ${projects.length} existing projects in 'projects' collection.`);

  // If project 6aca20b65617b33c12989f27 is not yet in projects, create it from fashion store template
  const targetId = "6aca20b65617b33c12989f27";
  const existingTarget = await projectsCol.findOne({ _id: new mongoose.Types.ObjectId(targetId) });
  if (!existingTarget) {
    console.log(`Inserting target project ${targetId} into 'projects' collection...`);
    // Find an existing project with rich data or create one
    const templateProject = projects.find(p => p.data && p.data.pages && p.data.pages.length > 0) || projects[0];
    const newTargetDoc = {
      _id: new mongoose.Types.ObjectId(targetId),
      user: defaultUserId,
      title: "Fashion Store Agency Website",
      description: "Ecommerce",
      data: templateProject?.data || {
        pages: [{ id: "home", name: "Home", components: [] }],
        theme: "light",
        designTokens: { primaryColor: "#2563eb", secondaryColor: "#4f46e5" }
      },
      published: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await projectsCol.replaceOne({ _id: newTargetDoc._id }, newTargetDoc, { upsert: true });
  }

  // 2. Link all projects to Diksha's account so they show up under her dashboard
  await projectsCol.updateMany({}, { $set: { user: defaultUserId } });

  // 3. Mirror all documents to singular 'project' collection
  const allProjects = await projectsCol.find({}).toArray();
  for (const p of allProjects) {
    await projectSingularCol.replaceOne({ _id: p._id }, p, { upsert: true });
  }

  const pPluralCount = await projectsCol.countDocuments();
  const pSingularCount = await projectSingularCol.countDocuments();

  console.log(`Synchronization Complete!`);
  console.log(`'projects' count: ${pPluralCount}`);
  console.log(`'project' count: ${pSingularCount}`);

  const sample = await projectSingularCol.find({}, { projection: { title: 1, user: 1 } }).toArray();
  console.log("Projects in 'project' collection:", sample);

  await mongoose.disconnect();
}

sync().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
