const asyncHandler = require('express-async-handler');
const Diary = require('../models/diaryModel');

// @desc    Get all diary entries for the logged in user
// @route   GET /api/diary
// @access  Private
const getDiaryEntries = asyncHandler(async (req, res) => {
  try {
    const entries = await Diary.find({ user: req.user._id }).sort({ date: -1 });
    console.log(`Found ${entries.length} diary entries for user ${req.user._id}`);
    res.json(entries);
  } catch (error) {
    console.error(`Error fetching diary entries: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new diary entry
// @route   POST /api/diary
// @access  Private
const createDiaryEntry = asyncHandler(async (req, res) => {
  const { title, content, date, wordCount } = req.body;

  console.log('Creating new diary entry');
  console.log('Request payload:', req.body);

  if (!title || !content || !date) {
    console.error('Missing required fields');
    res.status(400);
    throw new Error('Please provide title, content, and date');
  }

  try {
    const entry = await Diary.create({
      user: req.user._id,
      title,
      content,
      date,
      wordCount: wordCount || 0
    });

    console.log(`Diary entry created successfully with ID: ${entry._id}`);
    res.status(201).json(entry);
  } catch (error) {
    console.error(`Error creating diary entry: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single diary entry
// @route   GET /api/diary/entry/:id
// @access  Private
const getDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await Diary.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
  }

  // Check if the diary entry belongs to the logged in user
  if (entry.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this diary entry');
  }

  res.json(entry);
});

// @desc    Update a diary entry
// @route   PUT /api/diary/entry/:id
// @access  Private
const updateDiaryEntry = asyncHandler(async (req, res) => {
  const { title, content, date, wordCount } = req.body;

  const entry = await Diary.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
  }

  // Check if the diary entry belongs to the logged in user
  if (entry.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this diary entry');
  }

  entry.title = title || entry.title;
  entry.content = content || entry.content;
  entry.date = date || entry.date;
  entry.wordCount = wordCount || entry.wordCount;

  const updatedEntry = await entry.save();

  res.json(updatedEntry);
});

// @desc    Delete a diary entry
// @route   DELETE /api/diary/entry/:id
// @access  Private
const deleteDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await Diary.findById(req.params.id);

  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
  }

  // Check if the diary entry belongs to the logged in user
  if (entry.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this diary entry');
  }

  await entry.deleteOne();

  res.json({ message: 'Diary entry removed' });
});

module.exports = {
  getDiaryEntries,
  createDiaryEntry,
  getDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry
};