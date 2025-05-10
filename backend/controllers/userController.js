const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        username,
        password, // Will be hashed in the userModel
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check for username
    const user = await User.findOne({ username });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Export all user data (journals, diaries, buckets)
// @route   GET /api/users/export
// @access  Private
const exportUserData = asyncHandler(async (req, res) => {
    try {
        // Get user data without password
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Get all the user's journals
        const Journal = require('../models/journalModel');
        const journals = await Journal.find({ user: req.user._id });

        // Simplify journals data to only include essential textual content
        const simplifiedJournals = journals.map(journal => ({
            title: journal.title,
            content: journal.content,
            date: journal.date,
        }));

        // Get all the user's diary entries
        const Diary = require('../models/diaryModel');
        const diaries = await Diary.find({ user: req.user._id });

        // Simplify diary data to only include essential textual content
        const simplifiedDiaries = diaries.map(diary => ({
            title: diary.title,
            content: diary.content,
            date: diary.date,
        }));

        // Get all the user's buckets with their items
        const Bucket = require('../models/bucketModel');
        const buckets = await Bucket.find({ user: req.user._id });

        // Simplify bucket data to only include essential textual content
        const simplifiedBuckets = buckets.map(bucket => ({
            name: bucket.name,
            description: bucket.description,
            items: bucket.items.map(item => ({
                content: item.content
            }))
        }));

        // Compile all data - simplified version with only textual content
        const exportData = {
            user: {
                username: user.username,
                createdAt: user.createdAt
            },
            journals: simplifiedJournals,
            diaries: simplifiedDiaries,
            buckets: simplifiedBuckets
        };

        // Send as JSON
        res.json({
            success: true,
            data: exportData,
            timestamp: new Date(),
            message: 'Data exported successfully'
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Error exporting data: ${error.message}`);
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    exportUserData
};