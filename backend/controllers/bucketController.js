const asyncHandler = require('express-async-handler');
const Bucket = require('../models/bucketModel');

// @desc    Get all buckets for a user
// @route   GET /api/buckets
// @access  Private
const getBuckets = asyncHandler(async (req, res) => {
    const buckets = await Bucket.find({ user: req.user.id });
    res.status(200).json(buckets);
});

// @desc    Create a new bucket
// @route   POST /api/buckets
// @access  Private
const createBucket = asyncHandler(async (req, res) => {
    const { name, description, icon, color } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a name for the bucket');
    }

    const bucket = await Bucket.create({
        user: req.user.id,
        name,
        description: description || '',
        icon: icon || '📝',
        color: color || '#3498db',
        items: [],
    });

    res.status(201).json(bucket);
});

// @desc    Get a single bucket
// @route   GET /api/buckets/:id
// @access  Private
const getBucket = asyncHandler(async (req, res) => {
    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to access this bucket');
    }

    res.status(200).json(bucket);
});

// @desc    Update bucket details
// @route   PUT /api/buckets/:id
// @access  Private
const updateBucket = asyncHandler(async (req, res) => {
    const { name, description, icon, color } = req.body;

    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this bucket');
    }

    // Update bucket details
    bucket.name = name || bucket.name;
    bucket.description = description !== undefined ? description : bucket.description;
    bucket.icon = icon || bucket.icon;
    bucket.color = color || bucket.color;

    const updatedBucket = await bucket.save();
    res.status(200).json(updatedBucket);
});

// @desc    Delete bucket
// @route   DELETE /api/buckets/:id
// @access  Private
const deleteBucket = asyncHandler(async (req, res) => {
    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this bucket');
    }

    await Bucket.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
});

// @desc    Add an item to a bucket
// @route   POST /api/buckets/:id/items
// @access  Private
const addBucketItem = asyncHandler(async (req, res) => {
    const { content, isHighlighted } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Please add content for the item');
    }

    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to modify this bucket');
    }

    const newItem = {
        content,
        isHighlighted: isHighlighted || false
    };

    bucket.items.push(newItem);

    await bucket.save();

    // Return the added item with its generated _id
    const addedItem = bucket.items[bucket.items.length - 1];
    res.status(201).json(addedItem);
});

// @desc    Update a bucket item
// @route   PUT /api/buckets/:id/items/:itemId
// @access  Private
const updateBucketItem = asyncHandler(async (req, res) => {
    const { content, isHighlighted } = req.body;
    const { id, itemId } = req.params;

    const bucket = await Bucket.findById(id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to modify this bucket');
    }

    // Find the item in the bucket
    const item = bucket.items.id(itemId);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    // Update the item fields
    if (content !== undefined) item.content = content;
    if (isHighlighted !== undefined) item.isHighlighted = isHighlighted;

    await bucket.save();
    res.status(200).json(item);
});

// @desc    Delete a bucket item
// @route   DELETE /api/buckets/:id/items/:itemId
// @access  Private
const deleteBucketItem = asyncHandler(async (req, res) => {
    const { id, itemId } = req.params;

    const bucket = await Bucket.findById(id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to modify this bucket');
    }

    // Find the item index to remove
    const itemIndex = bucket.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found');
    }

    // Remove the item from the array
    bucket.items.splice(itemIndex, 1);
    await bucket.save();

    res.status(200).json({ itemId });
});

// @desc    Toggle highlight flag for a bucket
// @route   PUT /api/buckets/:id/highlight
// @access  Private
const toggleHighlightBucket = asyncHandler(async (req, res) => {
    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
        res.status(404);
        throw new Error('Bucket not found');
    }

    // Check if the bucket belongs to the logged in user
    if (bucket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this bucket');
    }

    // Toggle the highlight flag
    bucket.isHighlighted = !bucket.isHighlighted;

    // Save the updated bucket
    const updatedBucket = await bucket.save();

    res.status(200).json(updatedBucket);
});

module.exports = {
    getBuckets,
    createBucket,
    getBucket,
    updateBucket,
    deleteBucket,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem,
    toggleHighlightBucket
};