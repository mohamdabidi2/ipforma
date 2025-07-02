const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['document', 'link', 'image', 'video'], default: 'document' },
});

const lessonSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'video', 'document', 'link', 'image', 'quiz'], default: 'text' },
  url: { type: String },
  duration: { type: String },
  order: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  resources: [resourceSchema],
});

const chapterSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  lessons: [lessonSchema],
});

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  durationWeeks: { type: Number, required: true },
  estimatedHours: { type: String, required: true },
  type: { type: String, enum: ['online', 'presentielle', 'hybrid'], required: true },
  category: { type: String, required: true },
  categoryPrefix: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  maxStudents: { type: Number },
  prerequisites: { type: String },
  objectives: { type: String },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  thumbnail: { type: String },
  difficulty: { type: Number, min: 1, max: 5, default: 1 },
  formationCode: { type: String, unique: true },
  content: [chapterSchema],
  reviews: [
    {
      reviewerName: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  professors: [
    {
      name: { type: String, required: true },
      bio: { type: String },
      photo: { type: String },
    },
  ],
});

module.exports = mongoose.model('Formation', formationSchema);


