const express = require('express');
const router = express.Router();
const {
    getBuckets,
    createBucket,
    getBucket,
    updateBucket,
    deleteBucket,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem
} = require('../controllers/bucketController');
const { protect } = require('../middleware/authMiddleware');

// All bucket routes require authentication
// Get all buckets / Create new bucket
router.route('/')
    .get(protect, getBuckets)
    .post(protect, createBucket);

// Get single bucket / Update bucket / Delete bucket
router.route('/:id')
    .get(protect, getBucket)
    .put(protect, updateBucket)
    .delete(protect, deleteBucket);

// Add item to a bucket
router.route('/:id/items')
    .post(protect, addBucketItem);

// Update or delete an item in a bucket
router.route('/:id/items/:itemId')
    .put(protect, updateBucketItem)
    .delete(protect, deleteBucketItem);

module.exports = router;