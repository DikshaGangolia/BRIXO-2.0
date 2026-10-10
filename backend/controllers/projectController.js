const mongoose = require("mongoose");
const Project = require("../models/Project");
const PublishedWebsite = require("../models/PublishedWebsite");
const QRCode = require("qrcode");

// Dual database and dual collection sync helper (brixodb and brixo)
const syncAcrossDbsAndCollections = async (projectDoc) => {
  try {
    const client = mongoose.connection.client;
    if (client && projectDoc) {
      const obj = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
      const targetDbs = ["brixodb", "brixo"];
      for (const dbName of targetDbs) {
        const db = client.db(dbName);
        await db.collection("projects").replaceOne({ _id: obj._id }, obj, { upsert: true });
        await db.collection("project").replaceOne({ _id: obj._id }, obj, { upsert: true });
      }
    }
  } catch (err) {
    console.warn("Cross-database sync warning:", err.message);
  }
};

const deleteAcrossDbsAndCollections = async (projectId) => {
  try {
    const client = mongoose.connection.client;
    if (client && projectId) {
      const targetDbs = ["brixodb", "brixo"];
      const idObj = mongoose.Types.ObjectId.isValid(projectId) ? new mongoose.Types.ObjectId(projectId) : projectId;
      for (const dbName of targetDbs) {
        const db = client.db(dbName);
        await db.collection("projects").deleteOne({ _id: idObj });
        await db.collection("project").deleteOne({ _id: idObj });
      }
    }
  } catch (err) {
    console.warn("Cross-database delete warning:", err.message);
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { title, description, data } = req.body;

    if (!title || !data) {
      return res.status(400).json({
        success: false,
        message: "Title and project data are required",
      });
    }

    const userId = req.user?.id || (await mongoose.connection.db.collection("users").findOne({}))?._id;

    const project = await Project.create({
      user: userId,
      title,
      description: description || "",
      data,
    });

    await syncAcrossDbsAndCollections(project);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ updatedAt: -1 });

    res.json({
      success: true,
      projects,
    });

  } catch (error) {

    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Get single project (Private)
const getProjectById = async (req, res) => {
  try {
    let project = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      project = await Project.findById(req.params.id);
    } else {
      project = await Project.findOne({
        $or: [
          { slug: req.params.id },
          { title: req.params.id }
        ]
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// Get public project (No login required)
const getPublicProjectById = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {

    console.error("PUBLIC PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// Update project (Persists changes directly into MongoDB)
const updateProject = async (req, res) => {
  try {
    const { title, description, data } = req.body;
    const projectId = req.params.id;

    const userId = req.user?.id || (await mongoose.connection.db.collection("users").findOne({}))?._id;

    let project = null;

    // 1. If valid ObjectId, try finding and updating by _id
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      const updateFields = {};
      if (title !== undefined) updateFields.title = title;
      if (description !== undefined) updateFields.description = description;
      if (data !== undefined) updateFields.data = data;
      if (userId) updateFields.user = userId;

      project = await Project.findByIdAndUpdate(
        projectId,
        updateFields,
        {
          new: true,
        }
      );
    }

    // 2. If not found by ObjectId (e.g. temporary ID or title match), find by title
    if (!project && title) {
      const updateFields = { title };
      if (description !== undefined) updateFields.description = description;
      if (data !== undefined) updateFields.data = data;
      if (userId) updateFields.user = userId;

      project = await Project.findOneAndUpdate(
        { title: title },
        updateFields,
        {
          new: true,
        }
      );
    }

    // 3. If still not found, create a new document in MongoDB!
    if (!project) {
      const newDoc = {
        user: userId,
        title: title || "Untitled Website",
        description: description || "",
        data: data || {},
      };
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        newDoc._id = new mongoose.Types.ObjectId(projectId);
      }

      project = await Project.create(newDoc);
    }

    // Dual database and dual collection sync (brixodb & brixo -> projects & project)
    await syncAcrossDbsAndCollections(project);

    res.json({
      success: true,
      message: "Project saved successfully to MongoDB",
      project,
    });

  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(projectId)) {
      await Project.findByIdAndDelete(projectId);
    } else {
      await Project.deleteOne({ title: projectId });
    }

    await deleteAcrossDbsAndCollections(projectId);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });

  } catch(error) {
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// Publish project & generate unique URL + high-res QR code
const publishProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Generate unique slug only once to keep URL stable on republish
    if (!project.slug) {
      const sanitizedTitle = project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      project.slug = `${sanitizedTitle}-${Math.random().toString(36).substring(2, 7)}`;
    }

    project.published = true;
    await project.save();

    const frontendBaseUrl = process.env.FRONTEND_URL || "https://your-domain.com";
    const publishUrl = `${frontendBaseUrl}/site/${project.slug}`;

    // Generate high-resolution PNG Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(publishUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    // Generate SVG string for vector exports
    const qrCodeSvg = await QRCode.toString(publishUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    // Create or update record in PublishedWebsite collection in MongoDB
    const publishedRecord = await PublishedWebsite.findOneAndUpdate(
      { project: project._id },
      {
        project: project._id,
        user: req.user.id,
        title: project.title,
        slug: project.slug,
        url: publishUrl,
        qrCodeDataUrl,
        qrCodeSvg,
        status: "PUBLISHED",
        data: project.data,
        publishedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      project,
      publishUrl,
      slug: project.slug,
      qrCodeDataUrl,
      qrCodeSvg,
      publishedRecord,
    });
  } catch (error) {
    console.error("Publish error:", error);

    res.status(500).json({
      success: false,
      message: "Server error publishing site: " + error.message,
    });
  }
};

// Unpublish project & set status to UNPUBLISHED
const unpublishProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.published = false;
    await project.save();

    await PublishedWebsite.findOneAndUpdate(
      { project: project._id },
      { status: "UNPUBLISHED" }
    );

    res.json({
      success: true,
      message: "Website unpublished successfully",
      project,
    });
  } catch (error) {
    console.error("Unpublish error:", error);
    res.status(500).json({
      success: false,
      message: "Server error unpublishing site",
    });
  }
};

// Get public website by slug (No auth required)
const getPublicSiteBySlug = async (req, res) => {
  try {
    const site = await PublishedWebsite.findOne({ slug: req.params.slug });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    if (site.status === "UNPUBLISHED") {
      return res.status(403).json({
        success: false,
        status: "UNPUBLISHED",
        message: "Website Not Available",
      });
    }

    res.json({
      success: true,
      site,
    });
  } catch (error) {
    console.error("Get public site by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Verify project ownership before allowing ZIP export
const verifyExportOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    let project = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({ user: req.user.id });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (String(project.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only download code for your own generated websites.",
      });
    }

    res.json({
      success: true,
      message: "Ownership verified. Authorized to export website bundle.",
      projectId: project._id,
      title: project.title,
    });
  } catch (error) {
    console.error("Export verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error verifying project ownership",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getPublicProjectById,
  updateProject,
  deleteProject,
  publishProject,
  unpublishProject,
  getPublicSiteBySlug,
  verifyExportOwnership,
};