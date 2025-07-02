const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  updateUser, 
  deleteUser,
  getInstructors,
  getStudents,
  getUsersSelect,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const { protect, authorize, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes for all authenticated users
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Protected routes for admin and reception
router.get('/', protect, authorize(['admin', 'reception']), getUsers);
router.get('/values', protect, authorize(['admin', 'reception']), getUsersSelect);
router.get('/instructors', protect, authorize(['admin', 'reception']), getInstructors);
router.get('/students', protect, authorize(['admin', 'reception']), getStudents);

// Admin-only routes
router.put('/:id', protect, authorize(['admin']), updateUser);
router.delete('/:id', protect, authorize(['admin']), deleteUser);

module.exports = router;

