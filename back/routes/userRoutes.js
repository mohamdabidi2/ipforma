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
  updateProfile,
  getStudentsbyFormation
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
router.get('/', protect, authorize(['admin', 'reception',"teacher"]), getUsers);
router.get('/values', protect, authorize(['admin', 'reception']), getUsersSelect);
router.get('/instructors', protect, authorize(['admin', 'reception']), getInstructors);
router.get('/students', protect, authorize(['admin' ,'reception']), getStudents);
router.get('/students/my', protect, authorize(['admin' ,'reception',"teacher"]), getStudentsbyFormation);

// Admin-only routes
router.put('/:id', protect, authorize(['admin','reception']), updateUser);
router.delete('/:id', protect, authorize(['admin','reception']), deleteUser);

module.exports = router;

