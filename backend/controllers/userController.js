const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Journal = require('../models/journalModel');
const Diary = require('../models/diaryModel');
const Bucket = require('../models/bucketModel');

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

// @desc    Export user data
// @route   GET /api/users/export
// @access  Private
const exportUserData = asyncHandler(async (req, res) => {
    try {
        // Get the authenticated user
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Get all the user's journals
        const journals = await Journal.find({ user: req.user._id });

        // Simplify journal data to only include essential textual content
        const simplifiedJournals = journals.map(journal => ({
            title: journal.title,
            content: journal.content,
            date: journal.date,
        }));

        // Get all the user's diaries
        const diaries = await Diary.find({ user: req.user._id });

        // Simplify diary data to only include essential textual content
        const simplifiedDiaries = diaries.map(diary => ({
            title: diary.title,
            content: diary.content,
            date: diary.date,
        }));

        // Get all the user's buckets with their items
        const buckets = await Bucket.find({ user: req.user._id });

        // Simplify bucket data to only include essential textual content
        const simplifiedBuckets = buckets.map(bucket => ({
            name: bucket.name,
            description: bucket.description,
            pinned: bucket.isHighlighted,
            items: bucket.items.map(item => ({
                content: item.content,
                pinned: item.isHighlighted
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
        console.error('Error exporting user data:', error);
        res.status(500);
        throw new Error('Could not export data: ' + error.message);
    }
});

// Helper function to decrypt fields in an array of objects
const decryptArray = async (array, fields, decrypt) => {
    return Promise.all(array.map(async (item) => {
        const decryptedItem = { ...item };
        for (const field of fields) {
            if (item[field]) {
                try {
                    decryptedItem[field] = await decrypt(item[field]);
                } catch (err) {
                    console.error(`Failed to decrypt ${field}:`, err);
                }
            }
        }
        return decryptedItem;
    }));
};

// @desc    Import user data
// @route   POST /api/users/import
// @access  Private
const importUserData = asyncHandler(async (req, res) => {
    try {
        // Get the authenticated user
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const { importData, isEncrypted } = req.body;

        // Basic validation
        if (!importData || !importData.user ||
            !Array.isArray(importData.journals) ||
            !Array.isArray(importData.diaries) ||
            !Array.isArray(importData.buckets)) {
            res.status(400);
            throw new Error('Invalid import data structure');
        }

        const decrypt = req.decrypt; // Assume decrypt function is available in the request

        // Decrypt data if encrypted
        if (isEncrypted) {
            importData.journals = await decryptArray(importData.journals, ['title', 'content'], decrypt);
            importData.diaries = await decryptArray(importData.diaries, ['title', 'content'], decrypt);
            importData.buckets = await Promise.all(importData.buckets.map(async (bucket) => {
                const decryptedBucket = { ...bucket };
                if (bucket.name) decryptedBucket.name = await decrypt(bucket.name);
                if (bucket.description) decryptedBucket.description = await decrypt(bucket.description);
                if (bucket.items && Array.isArray(bucket.items)) {
                    decryptedBucket.items = await decryptArray(bucket.items, ['content'], decrypt);
                }
                return decryptedBucket;
            }));
        }

        // Import journals - with duplicate prevention
        let importedJournals = 0;
        let skippedJournals = 0;

        // Get existing journals to check for duplicates
        const existingJournals = await Journal.find({ user: req.user._id });

        for (const journalData of importData.journals) {
            if (journalData.title && journalData.content && journalData.date) {
                // Check for duplicates
                const isDuplicate = existingJournals.some(
                    existingJournal =>
                        existingJournal.title === journalData.title &&
                        existingJournal.content === journalData.content
                );

                if (isDuplicate) {
                    skippedJournals++;
                    continue;
                }

                await Journal.create({
                    user: req.user._id,
                    title: journalData.title,
                    content: journalData.content,
                    date: new Date(journalData.date),
                    mood: journalData.mood || 'neutral'
                });
                importedJournals++;
            }
        }

        // Import diaries - with duplicate prevention
        let importedDiaries = 0;
        let skippedDiaries = 0;

        // Get existing diaries to check for duplicates
        const existingDiaries = await Diary.find({ user: req.user._id });

        for (const diaryData of importData.diaries) {
            if (diaryData.title && diaryData.content && diaryData.date) {
                // Check for duplicates
                const isDuplicate = existingDiaries.some(
                    existingDiary =>
                        existingDiary.title === diaryData.title &&
                        existingDiary.content === diaryData.content
                );

                if (isDuplicate) {
                    skippedDiaries++;
                    continue;
                }

                await Diary.create({
                    user: req.user._id,
                    title: diaryData.title,
                    content: diaryData.content,
                    date: new Date(diaryData.date),
                    wordCount: diaryData.wordCount || 0
                });
                importedDiaries++;
            }
        }

        // Import buckets - with merging for duplicates
        let importedBuckets = 0;
        let mergedBuckets = 0;
        let importedItems = 0;

        // Get existing buckets to check for duplicates
        const existingBuckets = await Bucket.find({ user: req.user._id });

        for (const bucketData of importData.buckets) {
            if (bucketData.name && Array.isArray(bucketData.items)) {
                // Check for existing bucket with same name and description (or empty description)
                const existingBucket = existingBuckets.find(
                    bucket => {
                        // Match by name
                        const nameMatches = bucket.name === bucketData.name;

                        // Match descriptions, handling empty values
                        const bucketDesc = bucket.description || '';
                        const importDesc = bucketData.description || '';

                        const descMatches = bucketDesc === importDesc;

                        // Return true if both name and description match
                        return nameMatches && descMatches;
                    }
                );

                if (existingBucket) {
                    // Merge items into existing bucket
                    let itemsAdded = 0;
                    let skippedItems = 0;

                    for (const itemData of bucketData.items) {
                        if (itemData.content) {
                            // Check if an item with the same content already exists in the bucket
                            const isDuplicate = existingBucket.items.some(
                                existingItem => existingItem.content === itemData.content
                            );

                            if (isDuplicate) {
                                skippedItems++;
                                continue; // Skip adding this item
                            }

                            // Add only non-duplicate items
                            existingBucket.items.push({
                                content: itemData.content,
                                isHighlighted: itemData.pinned || false
                            });
                            itemsAdded++;
                        }
                    }

                    await existingBucket.save();
                    mergedBuckets++;
                    importedItems += itemsAdded;
                } else {
                    // Create a new bucket
                    const bucket = await Bucket.create({
                        user: req.user._id,
                        name: bucketData.name,
                        description: bucketData.description || '',
                        icon: bucketData.icon || '📝',
                        color: bucketData.color || '#3498db',
                        isHighlighted: bucketData.pinned || false,
                        items: []
                    });

                    // Add items to the bucket (no need to check for duplicates in a new bucket)
                    for (const itemData of bucketData.items) {
                        if (itemData.content) {
                            bucket.items.push({
                                content: itemData.content,
                                isHighlighted: itemData.pinned || false
                            });
                            importedItems++;
                        }
                    }

                    await bucket.save();
                    importedBuckets++;
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully imported ${importedJournals} journals, ${importedDiaries} diaries, ${importedBuckets} new buckets with ${importedItems} items. Skipped ${skippedJournals} duplicate journals, ${skippedDiaries} duplicate diaries, and merged items into ${mergedBuckets} existing buckets.`,
            stats: {
                journals: {
                    imported: importedJournals,
                    skipped: skippedJournals
                },
                diaries: {
                    imported: importedDiaries,
                    skipped: skippedDiaries
                },
                buckets: {
                    new: importedBuckets,
                    merged: mergedBuckets,
                    items: importedItems
                }
            }
        });

    } catch (error) {
        console.error('Error importing user data:', error);
        res.status(500);
        throw new Error('Could not import data: ' + error.message);
    }
});

// @desc    Delete user account and all associated data
// @route   DELETE /api/users/delete
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Verify password
        if (!(await user.matchPassword(password))) {
            res.status(401);
            throw new Error('Incorrect password');
        }

        // Delete all user's journal entries
        await Journal.deleteMany({ user: userId });

        // Delete all user's diary entries
        await Diary.deleteMany({ user: userId });

        // Delete all user's bucket list items
        await Bucket.deleteMany({ user: userId });

        // Finally delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User account and all data successfully deleted' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Failed to delete user account');
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
    exportUserData,
    importUserData,
    deleteUser
};