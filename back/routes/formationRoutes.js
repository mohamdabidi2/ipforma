const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  createFormation,
  getFormations,
  getFormationsList,
  updateFormation,
  getFormationById,
  deleteFormation,
  uploadThumbnail,
  updateFormationContent,
  getFormationsMy,
} = require("../controllers/formationController");

const router = express.Router();

// Public routes
router.get("/", getFormations);
router.get("/my/list",protect, getFormationsMy);
router.get("/list/all", getFormationsList);
router.get("/:id", getFormationById);

// Protected routes (admin only)
router.post("/", createFormation);
router.put("/:id", protect, authorize(["admin"]), updateFormation);
router.delete("/:id", protect, authorize(["admin"]), deleteFormation);

// Thumbnail upload route
router.post("/upload-thumbnail", protect, authorize(["admin"]), upload.single("thumbnail"), uploadThumbnail);

// Content update route
router.put("/:id/content", protect, authorize(["admin"]), updateFormationContent);

module.exports = router;


