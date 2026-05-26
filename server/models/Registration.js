const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Waitlisted'],
    default: 'Confirmed'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  completionStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Absent'],
    default: 'Not Started'
  }
}, {
  timestamps: true
});

// Prevent duplicate registrations
registrationSchema.index({ event: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
