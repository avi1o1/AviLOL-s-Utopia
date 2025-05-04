const asyncHandler = require('express-async-handler');
const Diary = require('../models/diaryModel');

// @desc    Get all diary entries
// @route   GET /api/diary
// @access  Public
const getDiaryEntries = asyncHandler(async (req, res) => {
  try {
    const entries = await Diary.find().sort({ date: -1 });
    console.log(`Found ${entries.length} diary entries`);
    res.json(entries);
  } catch (error) {
    console.error(`Error fetching diary entries: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new diary entry
// @route   POST /api/diary
// @access  Public
const createDiaryEntry = asyncHandler(async (req, res) => {
  const { title, content, date, week, wordCount } = req.body;
  
  console.log('Creating new diary entry');
  console.log('Request payload:', req.body);
  
  if (!title || !content || !date) {
    console.error('Missing required fields');
    res.status(400);
    throw new Error('Please provide title, content, and date');
  }
  
  try {
    const entry = await Diary.create({
      title,
      content,
      date,
      week,
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
// @access  Public
const getDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await Diary.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
  }
  
  res.json(entry);
});

// @desc    Update a diary entry
// @route   PUT /api/diary/entry/:id
// @access  Public
const updateDiaryEntry = asyncHandler(async (req, res) => {
  const { title, content, date, week, wordCount } = req.body;
  
  const entry = await Diary.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
  }
  
  entry.title = title || entry.title;
  entry.content = content || entry.content;
  entry.date = date || entry.date;
  entry.week = week || entry.week;
  entry.wordCount = wordCount || entry.wordCount;
  
  const updatedEntry = await entry.save();
  
  res.json(updatedEntry);
});

// @desc    Delete a diary entry
// @route   DELETE /api/diary/entry/:id
// @access  Public
const deleteDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await Diary.findById(req.params.id);
  
  if (!entry) {
    res.status(404);
    throw new Error('Diary entry not found');
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