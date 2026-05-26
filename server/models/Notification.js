const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'EVENT_CREATED',
      'EVENT_UPDATED',
      'EVENT_CANCELLED',
      'REGISTRATION_CONFIRMED',
      'REGISTRATION_CANCELLED',
      'EVENT_REMINDER',
      'ATTENDANCE_MARKED',
      'MATERIAL_UPLOADED',
      'FEEDBACK_REQUEST',
      'SYSTEM'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingEvent'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
