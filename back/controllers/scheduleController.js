const Schedule = require("../models/Schedule");

// Create or update schedule entry for a specific week
exports.saveSchedule = async (req, res) => {
  try {
    const { 
      teacherId, 
      formationId, 
      weekNumber,
      year,
      scheduleEntry
    } = req.body;

    // Check if a schedule already exists for this teacher, formation, week, and year
    let existingSchedule = await Schedule.findOne({ 
      teacherId, 
      formationId, 
      weekNumber, 
      year 
    });

    if (existingSchedule) {
      // Check if an entry already exists for this day and time
      const existingEntryIndex = existingSchedule.schedule.findIndex(
        entry => entry.day === scheduleEntry.day && 
                entry.startTime === scheduleEntry.startTime && 
                entry.endTime === scheduleEntry.endTime
      );

      if (existingEntryIndex >= 0) {
        // Update existing entry
        existingSchedule.schedule[existingEntryIndex] = scheduleEntry;
      } else {
        // Add new entry to the array
        existingSchedule.schedule.push(scheduleEntry);
      }

      existingSchedule.updatedAt = new Date();
      await existingSchedule.save();
      return res.status(200).json({ 
        message: "Schedule updated", 
        schedule: existingSchedule,
        _id: existingSchedule._id
      });
    } else {
      // Create new schedule document for this week
      const newSchedule = new Schedule({
        teacherId,
        formationId,
        weekNumber,
        year,
        schedule: [scheduleEntry],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newSchedule.save();
      return res.status(201).json({ 
        message: "Schedule created", 
        schedule: newSchedule,
        _id: newSchedule._id
      });
    }
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get schedules for a specific week and year
exports.getWeekSchedules = async (req, res) => {
  try {
    const { weekNumber, year } = req.params;
    const teacherId = req.user._id;

    const schedules = await Schedule.find({ 
      teacherId, 
      weekNumber: parseInt(weekNumber), 
      year: parseInt(year) 
    }).populate('formationId');

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching week schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get schedule by instructor and week (legacy support)
exports.getSchedule = async (req, res) => {
  try {
    const { week } = req.params;
    const instructorId = req.user._id;
    const currentYear = new Date().getFullYear();
    
    const schedule = await Schedule.findOne({ 
      teacherId: instructorId, 
      weekNumber: parseInt(week),
      year: currentYear
    });

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found" });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a specific schedule entry
exports.updateScheduleEntry = async (req, res) => {
  try {
    const { scheduleId, entryId } = req.params;
    const teacherId = req.user._id;
    const { scheduleEntry } = req.body;

    const schedule = await Schedule.findOne({  teacherId: teacherId });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found or not authorized" });
    }

    // Find and update the specific entry
    const entryIndex = schedule.schedule.findIndex(
      entry => entry._id.toString() === entryId
    );

    if (entryIndex >= 0) {
      schedule.schedule[entryIndex] = { ...schedule.schedule[entryIndex], ...scheduleEntry };
      schedule.updatedAt = new Date();
      await schedule.save();

      res.status(200).json({
        message: "Schedule entry updated",
        schedule
      });
    } else {
      res.status(404).json({ message: "Schedule entry not found" });
    }
  } catch (error) {
    console.error("Error updating schedule entry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a specific schedule entry
exports.deleteScheduleEntry = async (req, res) => {
  try {
    const { scheduleId, entryId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Remove the specific entry from the array
    schedule.schedule = schedule.schedule.filter(
      entry => entry._id.toString() !== entryId
    );
    
    schedule.updatedAt = new Date();
    await schedule.save();

    res.status(200).json({ 
      message: "Schedule entry deleted", 
      schedule 
    });
  } catch (error) {
    console.error("Error deleting schedule entry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete entire schedule document
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: "Schedule deleted" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

