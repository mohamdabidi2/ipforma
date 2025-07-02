const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: false },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  codeCin: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'reception'], 
    default: 'student' 
  },
  isActive: { type: Boolean, default: true },
  formations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formation' 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

const demoUsers = [
  {
    name: 'Ahmed',
    lastname: 'Ben Ali',
    email: 'ahmed@example.com',
    phone: '+216 12 345 678',
    codeCin: '12345678',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Fatma',
    lastname: 'Trabelsi',
    email: 'fatma@example.com',
    phone: '+216 12 345 679',
    codeCin: '12345679',
    password: 'password123',
    role: 'teacher'
  },
  {
    name: 'Mohamed',
    lastname: 'Sassi',
    email: 'mohamed@example.com',
    phone: '+216 12 345 680',
    codeCin: '12345680',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Leila',
    lastname: 'Mansouri',
    email: 'leila@example.com',
    phone: '+216 12 345 681',
    codeCin: '12345681',
    password: 'password123',
    role: 'reception'
  }
];

async function createDemoUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created ${userData.role}: ${userData.name} ${userData.lastname} (${userData.phone})`);
    }

    console.log('Demo users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
