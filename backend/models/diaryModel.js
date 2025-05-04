const mongoose = require('mongoose');

const diarySchema = mongoose.Schema(
  {
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
    week: {
      type: String,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;