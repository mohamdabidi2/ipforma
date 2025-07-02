const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get student's schedule for a specific week
router.get('/my-schedule', protect, authorize(['student']), async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Get week number and year from start date
    const weekNumber = getWeekNumber(startDate);
    const year = startDate.getFullYear();

    // Find all schedules for this week where the student is included
    const schedules = await Schedule.find({
      weekNumber,
      year,
      'schedule.students': req.user._id
    })
    .populate('teacherId', 'name lastname')
    .populate('formationId', 'title');

    // Transform the data to match frontend expectations
    const studentSchedule = [];
    
    schedules.forEach(schedule => {
      schedule.schedule.forEach(timeSlot => {
        // Only include time slots where this student is assigned
        if (timeSlot.students.some(studentId => studentId.toString() === req.user._id.toString())) {
          const dayOfWeek = getDayOfWeekNumber(timeSlot.day);
          
          studentSchedule.push({
            _id: `${schedule._id}_${timeSlot._id}`,
            title: schedule.formationId?.title || 'Formation',
            dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            teacher: {
              _id: schedule.teacherId._id,
              name: schedule.teacherId.name,
              lastname: schedule.teacherId.lastname
            },
            formation: schedule.formationId ? {
              _id: schedule.formationId._id,
              title: schedule.formationId.title
            } : null,
            location: timeSlot.room,
            notes: timeSlot.notes
          });
        }
      });
    });

    res.json(studentSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's upcoming classes
router.get('/upcoming', protect, authorize(['student']), async (req, res) => {
  try {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Find schedules for current and next week
    const schedules = await Schedule.find({
      $or: [
        { weekNumber, year },
        { weekNumber: weekNumber + 1, year }
      ],
      'schedule.students': req.user._id
    })
    .populate('teacherId', 'name lastname')
    .populate('formationId', 'title');

    const upcomingClasses = [];
    
    schedules.forEach(schedule => {
      schedule.schedule.forEach(timeSlot => {
        if (timeSlot.students.some(studentId => studentId.toString() === req.user._id.toString())) {
          const dayOfWeek = getDayOfWeekNumber(timeSlot.day);
          
          // Calculate if this class is upcoming
          const isThisWeek = schedule.weekNumber === weekNumber;
          const isUpcoming = isThisWeek ? 
            (dayOfWeek > currentDay || (dayOfWeek === currentDay && timeSlot.startTime > currentTime)) :
            true; // Next week classes are always upcoming
          
          if (isUpcoming) {
            upcomingClasses.push({
              _id: `${schedule._id}_${timeSlot._id}`,
              title: schedule.formationId?.title || 'Formation',
              dayOfWeek,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              teacher: {
                _id: schedule.teacherId._id,
                name: schedule.teacherId.name,
                lastname: schedule.teacherId.lastname
              },
              formation: schedule.formationId ? {
                _id: schedule.formationId._id,
                title: schedule.formationId.title
              } : null,
              location: timeSlot.room,
              weekNumber: schedule.weekNumber,
              year: schedule.year
            });
          }
        }
      });
    });

    // Sort by week, day, and time
    upcomingClasses.sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    res.json(upcomingClasses.slice(0, 10)); // Return next 10 classes
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's schedule statistics
router.get('/stats', protect, authorize(['student']), async (req, res) => {
  try {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    // Get current week schedules
    const currentWeekSchedules = await Schedule.find({
      weekNumber,
      year,
      'schedule.students': req.user._id
    })
    .populate('teacherId', 'name lastname')
    .populate('formationId', 'title');

    let totalClasses = 0;
    let totalHours = 0;
    const teachers = new Set();
    const formations = new Set();

    currentWeekSchedules.forEach(schedule => {
      schedule.schedule.forEach(timeSlot => {
        if (timeSlot.students.some(studentId => studentId.toString() === req.user._id.toString())) {
          totalClasses++;
          
          // Calculate hours
          const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
          const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          totalHours += (endMinutes - startMinutes) / 60;
          
          teachers.add(schedule.teacherId._id.toString());
          if (schedule.formationId) {
            formations.add(schedule.formationId._id.toString());
          }
        }
      });
    });

    res.json({
      totalClasses,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      totalTeachers: teachers.size,
      totalFormations: formations.size,
      weekNumber,
      year
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper function to convert day name to number
function getDayOfWeekNumber(dayName) {
  const days = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
  };
  return days[dayName.toLowerCase()] || 1;
}

module.exports = router;

