const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  getPublicProjectById,
  updateProject,
  deleteProject,
  publishProject,
} = require("../controllers/projectController");
// Create project
router.post("/", createProject);

// Public Preview Route
router.get("/public/:id", getPublicProjectById);

// Get all projects
router.get("/", getProjects);

// Publish project
router.put("/publish/:id", publishProject);

// Get single project
router.get("/:id", getProjectById);

// Update project
router.put("/:id", updateProject);

// Delete project
router.delete("/:id", deleteProject);

module.exports = router;