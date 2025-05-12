const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    exportUserData,
    importUserData,
    deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/export', protect, exportUserData);
router.post('/import', protect, importUserData);
router.delete('/delete', protect, deleteUser);

module.exports = router;