const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  createPreinscription,
  getPreinscriptions,
  getPreinscriptionById,
  updatePreinscription,
  deletePreinscription,
  checkExistingPreinscription,
} = require("../controllers/preinscriptionController");

const router = express.Router();

// Route to check if user already has a pre-inscription for a formation
router.get("/check/:formationId", protect, checkExistingPreinscription);

// Public route for creating a pre-inscription
router.post("/", protect, createPreinscription);

// Protected routes (admin only)
router.get("/", protect, authorize(["admin","reception"]), getPreinscriptions);
router.get("/:id", protect, authorize(["admin","reception"]), getPreinscriptionById);
router.put("/:id", protect, authorize(["admin","reception"]), updatePreinscription);
router.delete("/:id", protect, authorize(["admin","reception"]), deletePreinscription);

module.exports = router;

