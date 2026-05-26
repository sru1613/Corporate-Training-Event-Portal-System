const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: String
  },
  checkOutTime: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Prevent duplicate attendance records per event per employee per date
attendanceSchema.index({ event: 1, employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
