const express = require('express');
const {
  getDiaryEntries,
  createDiaryEntry,
  getDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry
} = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All diary routes are protected - require authentication
// Get all diary entries
router.get('/', protect, getDiaryEntries);

// Create a new diary entry
router.post('/', protect, createDiaryEntry);

// Get, update, or delete a specific diary entry
router.route('/entry/:id')
  .get(protect, getDiaryEntry)
  .put(protect, updateDiaryEntry)
  .delete(protect, deleteDiaryEntry);

module.exports = router;