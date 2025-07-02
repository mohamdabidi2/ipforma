const mongoose = require("mongoose");

const StatisticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  newInscriptions: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
  unpaidPayments: { type: Number, default: 0 },
  activeStudents: { type: Number, default: 0 },
  activeTeachers: { type: Number, default: 0 },
  totalFormations: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Statistics", StatisticsSchema);

