const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { protect } = require("../middlewares/authMiddleware");

// Save or update schedule entry for a specific week
router.post("/save", protect, scheduleController.saveSchedule);

// Get schedules for a specific week and year
router.get("/week/:weekNumber/:year", protect, scheduleController.getWeekSchedules);

// Get schedule by instructor and week (legacy support)
router.get("/:week", protect, scheduleController.getSchedule);

// Update a specific schedule entry
router.patch("/:scheduleId/:entryId", protect, scheduleController.updateScheduleEntry);

// Delete a specific schedule entry
router.delete("/:scheduleId/:entryId", protect, scheduleController.deleteScheduleEntry);

// Delete entire schedule document
router.delete("/:id", protect, scheduleController.deleteSchedule);

module.exports = router;

