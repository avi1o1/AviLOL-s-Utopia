const express = require('express');
const router = express.Router();
const {
  getJournalEntries,
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journalController');

// Get all journal entries / Create new journal entry
router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

// Get single journal entry / Update journal entry / Delete journal entry
router.route('/:id')
  .get(getJournalEntry)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

module.exports = router;