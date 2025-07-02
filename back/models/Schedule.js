const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  formationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formation",
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true },
    startTime: { type: String, required: true }, // Format: "HH:MM"
    endTime: { type: String, required: true }, // Format: "HH:MM"
    students: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    room: { type: String },
    notes: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Schedule", scheduleSchema);

