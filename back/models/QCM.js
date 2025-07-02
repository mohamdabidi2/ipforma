const mongoose = require('mongoose');

const qcmSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  formationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formation', 
    required: false // Made optional
  },
  title: { type: String, required: true },
  description: { type: String },
  questions: [{
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['multiple_choice', 'true_false', 'short_answer'], 
      default: 'multiple_choice' 
    },
    options: [{ type: String }], // Only for multiple choice questions
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be number (index) or string (for short answers)
    points: { type: Number, default: 1 }
  }],
  timeLimit: { type: Number, required: true }, // Duration in minutes
  startDate: { type: Date }, // When the QCM becomes available
  endDate: { type: Date }, // When the QCM expires
  showResults: { type: Boolean, default: true }, // Whether students can see their results
  allowRetake: { type: Boolean, default: false }, // Whether students can retake the QCM
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  results: [{
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    answers: [{ type: mongoose.Schema.Types.Mixed }], // Array of answers (can be numbers or strings)
    score: { type: Number, required: true }, // Percentage score
    correctAnswers: { type: Number, required: true }, // Number of correct answers
    totalQuestions: { type: Number, required: true }, // Total number of questions
    timeSpent: { type: Number, default: 0 }, // Time spent in minutes
    submittedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
qcmSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('QCM', qcmSchema);

