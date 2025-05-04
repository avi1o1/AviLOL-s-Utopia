const asyncHandler = require('express-async-handler');
const Journal = require('../models/journalModel');

// @desc    Get all journal entries
// @route   GET /api/journal
// @access  Public
const getJournalEntries = asyncHandler(async (req, res) => {
  try {
    const entries = await Journal.find().sort({ date: -1 });
    console.log(`Found ${entries.length} journal entries`);
    res.json(entries);
  } catch (error) {
    console.error(`Error fetching journal entries: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Public
const createJournalEntry = asyncHandler(async (req, res) => {
  const { title, content, date, mood } = req.body;
  
  console.log('Creating new journal entry');
  console.log('Request payload:', req.body);
  
  if (!title || !content || !date) {
    console.error('Missing required fields');
    res.status(400);
    throw new Error('Please provide title, content, and date');
  }
  
  try {
    const entry = await Journal.create({
      title,
      content,
      date,
      mood: mood || 'neutral'
    });
    
    console.log(`Journal entry created successfully with ID: ${entry._id}`);
    res.status(201).json(entry);
  } catch (error) {
    console.error(`Error creating journal entry: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single journal entry
// @route   GET /api/journal/:id
// @access  Public
const getJournalEntry = asyncHandler(async (req, res) => {
  const entry = await Journal.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Journal entry not found');
  }
  
  res.json(entry);
});

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Public
const updateJournalEntry = asyncHandler(async (req, res) => {
  const { title, content, date, mood } = req.body;
  
  const entry = await Journal.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Journal entry not found');
  }
  
  entry.title = title || entry.title;
  entry.content = content || entry.content;
  entry.date = date || entry.date;
  entry.mood = mood || entry.mood;
  
  const updatedEntry = await entry.save();
  
  res.json(updatedEntry);
});

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
// @access  Public
const deleteJournalEntry = asyncHandler(async (req, res) => {
  const entry = await Journal.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Journal entry not found');
  }
  
  await entry.deleteOne();
  
  res.json({ message: 'Journal entry removed' });
});

module.exports = {
  getJournalEntries,
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
};