const Project = require("../models/Project");
const PublishedWebsite = require("../models/PublishedWebsite");
const QRCode = require("qrcode");

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

    const project = await Project.create({
      user: req.user.id,
      title,
      description,
      data,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {

    const projects = await Project.find({
      user: req.user.id,
    });

    res.json({
      success: true,
      projects,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get single project (Private)
const getProjectById = async (req, res) => {
  try {

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

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
    console.log("GET PROJECT BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get public project (No login required)
const getPublicProjectById = async (req, res) => {
  try {

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

    console.log("PUBLIC PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        data: req.body.data,
        title: req.body.title,
        description: req.body.description
      },
      {
        new: true
      }
    );

    res.json({
      success: true,
      project
    });

  } catch(error) {

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success:false,
        message:"Project not found"
      });
    }

    res.json({
      success:true,
      message:"Project deleted successfully"
    });

  } catch(error) {

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Server Error"
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
};