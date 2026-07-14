const Project = require("../models/Project");


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


// Get single project
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

    // Generate slug only once
    if (!project.slug) {
      project.slug =
        project.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 7);
    }

    project.published = true;

    await project.save();

    // Use the actual production backend URL for the published site
    const baseUrl = process.env.PRODUCTION_URL || 'https://brixo-builder.vercel.app';
    res.json({
      success: true,
      project,
      publishUrl: `${baseUrl}/preview/${project._id}`,
    });
  } catch (error) {
    console.log(error);

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
};