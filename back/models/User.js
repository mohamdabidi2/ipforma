const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: false },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Used for login
  codeCin: { type: String, required: false },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'reception'], 
    default: 'student' 
  },
  isActive: { type: Boolean, default: true },
  formations: [],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

