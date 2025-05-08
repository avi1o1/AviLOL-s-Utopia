const express = require('express');
const router = express.Router();
const {
  getJournalEntries,
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

// All journal routes are protected - require authentication
// Get all journal entries / Create new journal entry
router.route('/')
  .get(protect, getJournalEntries)
  .post(protect, createJournalEntry);

// Get single journal entry / Update journal entry / Delete journal entry
router.route('/:id')
  .get(protect, getJournalEntry)
  .put(protect, updateJournalEntry)
  .delete(protect, deleteJournalEntry);

module.exports = router;