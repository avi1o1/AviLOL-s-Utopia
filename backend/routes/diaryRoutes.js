const express = require('express');
const {
  getDiaryEntries,
  createDiaryEntry,
  getDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry
} = require('../controllers/diaryController');

const router = express.Router();

// Get all diary entries
router.get('/', getDiaryEntries);

// Create a new diary entry
router.post('/', createDiaryEntry);

// Get, update, or delete a specific diary entry
router.route('/entry/:id')
  .get(getDiaryEntry)
  .put(updateDiaryEntry)
  .delete(deleteDiaryEntry);

module.exports = router;