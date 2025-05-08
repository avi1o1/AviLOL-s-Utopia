const mongoose = require('mongoose');

const journalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mood: {
      type: String,
      default: 'neutral',
    }
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  }
);

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;