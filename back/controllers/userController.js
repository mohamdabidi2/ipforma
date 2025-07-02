const { default: mongoose } = require('mongoose');
const User = require('../models/User');
const Formation = require('../models/formation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Existing generateToken function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, lastname, email, password, phone, codeCin, role, formation } = req.body;
  try {
    // Check if user exists by phone
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: 'User with this phone number already exists' });

    let formationData = null;
    
    if (formation) {
      // Validate formation ID format
      if (!mongoose.Types.ObjectId.isValid(formation)) {
        return res.status(400).json({ message: 'Invalid formation ID format' });
      }

      // Get complete formation data
      formationData = await Formation.findById(formation);
      if (!formationData) {
        return res.status(400).json({ message: 'Formation not found' });
      }
    }

    // Create user with formation reference
    const user = await User.create({ 
      name, 
      lastname, 
      email, 
      password, 
      phone, 
      codeCin, 
      formations: formationData ? [formationData] : [], 
      role: role || 'student' 
    });

    // Populate the formations data in the response
    const userWithFormation = await User.findById(user._id)
      .populate('formations')
      .select('-password')
      .lean();

    res.status(201).json({ 
      token: generateToken(user._id), 
      user: userWithFormation 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user (using phone instead of email)
exports.loginUser = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({ 
      token: generateToken(user._id), 
      user: userResponse 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (for admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users for select dropdown
exports.getUsersSelect = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name lastname _id');
    res.json(users.map(el => ({
      label: `${el.name} ${el.lastname}`,
      value: el._id,
      _id: el._id
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { name, lastname, email, phone, codeCin, role, isActive, formation } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.codeCin = codeCin || user.codeCin;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.updatedAt = new Date();

    // Handle formation update if provided
    if (formation !== undefined) {
      if (formation === null || formation === '') {
        // Clear formations if empty value provided
        user.formations = [];
      } else {
        // Validate formation ID
        if (!mongoose.Types.ObjectId.isValid(formation)) {
          return res.status(400).json({ message: 'Invalid formation ID format' });
        }

        const formationExists = await Formation.findById(formation);
        if (!formationExists) {
          return res.status(400).json({ message: 'Formation not found' });
        }

        // Update formations array (replace existing)
        user.formations = [formationExists];
      }
    }

    await user.save();
    
    // Get updated user with populated formations
    const updatedUser = await User.findById(user._id)
      .populate('formations')
      .select('-password')
      .lean();
    
    res.json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (soft delete by setting isActive to false)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({_id:req.params.id});
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teachers/instructors
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ 
      role: 'teacher', 
      isActive: true 
    }).select('-password');
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get students
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      isActive: true 
    }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentsbyFormation = async (req, res) => {
  try {
    // 1. Get the current user's ID and their formations
    const currentUser = await User.findById(req.user._id);
    
    // 2. If user has no formations, return empty array
    if (!currentUser.formations || currentUser.formations.length === 0) {
      return res.json([]);
    }

    // 3. Find all active students who share at least one formation with current user
    const students = await User.find({
      role: 'student',
      isActive: true,
      formations: { $in: currentUser.formations },
      _id: { $ne: req.user._id } // Exclude the current user
    }).select('-password');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile with password change support
exports.updateProfile = async (req, res) => {
  try {
    const { name, lastname, email, phone, codeCin, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    console.log(name, lastname, email, phone, codeCin, currentPassword, newPassword)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.matchPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      // Hash and update password
      const salt = await bcrypt.genSalt(10);
      user.password = newPassword
    }

    // Update other profile fields
    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.codeCin = codeCin || user.codeCin;
    user.updatedAt = new Date();

    await user.save();
    
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ 
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully', 
      user: userResponse 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

