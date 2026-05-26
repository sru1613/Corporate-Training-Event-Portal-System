const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingEvent',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  trainerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  contentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Overall rating is required']
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  suggestions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Suggestions cannot exceed 1000 characters']
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One feedback per employee per event
feedbackSchema.index({ event: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
