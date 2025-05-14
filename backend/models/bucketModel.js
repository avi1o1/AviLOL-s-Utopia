const mongoose = require('mongoose');

// Schema for individual bucket items
const bucketItemSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    // Optional flag to mark certain items (e.g., favorites within favorites)
    pinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Main bucket schema
const bucketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '📝', // Default icon
    },
    color: {
        type: String,
        default: '#3498db', // Default color
    },
    pinned: {
        type: Boolean,
        default: false
    },
    items: [bucketItemSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Bucket', bucketSchema);