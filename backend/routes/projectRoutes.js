const express = require("express");
const router = express.Router();
const premium = require("../middleware/premiumMiddleware");

const {
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
} = require("../controllers/projectController");

// Create project
router.post("/", createProject);

// Public Preview & Slug Routes (No Auth required)
router.get("/public/slug/:slug", getPublicSiteBySlug);
router.get("/public/:id", getPublicProjectById);

// Verify ownership before ZIP export
router.post("/:id/verify-export", verifyExportOwnership);

// Get all projects
router.get("/", getProjects);

// Publish & Unpublish project
router.put("/publish/:id", premium, publishProject);
router.put("/unpublish/:id", unpublishProject);

// Get single project
router.get("/:id", getProjectById);

// Update project
router.put("/:id", updateProject);

// Delete project
router.delete("/:id", deleteProject);

module.exports = router;