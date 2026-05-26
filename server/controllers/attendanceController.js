const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Trainer / Admin
const markAttendance = async (req, res) => {
  try {
    const { eventId, employeeId, status, date, checkInTime, checkOutTime, remarks } = req.body;

    const existing = await Attendance.findOne({
      event: eventId,
      employee: employeeId,
      date: new Date(date)
    });

    let attendance;
    if (existing) {
      attendance = await Attendance.findByIdAndUpdate(
        existing._id,
        { status, checkInTime, checkOutTime, remarks, markedBy: req.user._id },
        { new: true }
      );
    } else {
      attendance = await Attendance.create({
        event: eventId,
        employee: employeeId,
        markedBy: req.user._id,
        status, date: new Date(date), checkInTime, checkOutTime, remarks
      });

      // Update registration completion status
      if (status === 'Present' || status === 'Late') {
        await Registration.findOneAndUpdate(
          { event: eventId, employee: employeeId },
          { completionStatus: 'In Progress' }
        );
      }
    }

    await Notification.create({
      recipient: employeeId,
      sender: req.user._id,
      type: 'ATTENDANCE_MARKED',
      title: 'Attendance Marked',
      message: `Your attendance for the training has been marked as ${status}.`,
      relatedEvent: eventId
    });

    await attendance.populate([
      { path: 'employee', select: 'name email' },
      { path: 'event', select: 'title' }
    ]);

    res.status(201).json({ success: true, message: 'Attendance marked successfully', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Trainer / Admin
const bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId, date, attendanceList } = req.body;
    if (!eventId || !date || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({ success: false, message: 'eventId, date and attendanceList are required' });
    }

    const attendanceDate = new Date(date);

    // Run all upserts in parallel for speed
    const results = await Promise.all(attendanceList.map(async (item) => {
      const existing = await Attendance.findOne({
        event: eventId,
        employee: item.employeeId,
        date: attendanceDate
      });

      if (existing) {
        return Attendance.findByIdAndUpdate(
          existing._id,
          { status: item.status, markedBy: req.user._id, checkInTime: item.checkInTime, remarks: item.remarks },
          { new: true }
        );
      } else {
        const created = await Attendance.create({
          event: eventId,
          employee: item.employeeId,
          markedBy: req.user._id,
          status: item.status,
          date: attendanceDate,
          checkInTime: item.checkInTime,
          remarks: item.remarks
        });

        // Update registration completion status for present/late
        if (item.status === 'Present' || item.status === 'Late') {
          await Registration.findOneAndUpdate(
            { event: eventId, employee: item.employeeId },
            { completionStatus: 'In Progress' }
          );
        }

        return created;
      }
    }));

    // Send notifications in parallel
    await Promise.all(attendanceList.map(item =>
      Notification.create({
        recipient: item.employeeId,
        sender: req.user._id,
        type: 'ATTENDANCE_MARKED',
        title: 'Attendance Marked',
        message: `Your attendance has been marked as ${item.status}.`,
        relatedEvent: eventId
      }).catch(() => {}) // don't fail if notification creation fails
    ));

    res.json({ success: true, message: `Attendance marked for ${results.length} employees`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance for event
// @route   GET /api/attendance/event/:eventId
// @access  Trainer / Admin
const getEventAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { event: req.params.eventId };
    if (date) query.date = new Date(date);

    const attendance = await Attendance.find(query)
      .populate('employee', 'name email department employeeId')
      .populate('markedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Employee
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employee: req.user._id })
      .populate('event', 'title startDate endDate category')
      .sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance stats for event
// @route   GET /api/attendance/event/:eventId/stats
// @access  Trainer / Admin
const getAttendanceStats = async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      { $match: { event: require('mongoose').Types.ObjectId.createFromHexString(req.params.eventId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { markAttendance, bulkMarkAttendance, getEventAttendance, getMyAttendance, getAttendanceStats };
