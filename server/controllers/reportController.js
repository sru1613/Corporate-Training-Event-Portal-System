const TrainingEvent = require('../models/TrainingEvent');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Dashboard overview stats
// @route   GET /api/reports/dashboard
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const [totalEvents, totalUsers, totalRegistrations, totalAttendance, completedEvents, upcomingEvents] = await Promise.all([
      TrainingEvent.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Registration.countDocuments({ status: 'Confirmed' }),
      Attendance.countDocuments({ status: 'Present' }),
      TrainingEvent.countDocuments({ status: 'Completed' }),
      TrainingEvent.countDocuments({ status: 'Upcoming', startDate: { $gte: new Date() } })
    ]);

    const recentRegistrations = await Registration.find()
      .populate('event', 'title')
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 })
      .limit(5);

    const upcomingEventsList = await TrainingEvent.find({
      startDate: { $gte: new Date() },
      status: 'Upcoming'
    })
      .populate('trainers', 'name')
      .sort({ startDate: 1 })
      .limit(5);

    const eventsByMonth = await TrainingEvent.aggregate([
      {
        $group: {
          _id: { month: { $month: '$startDate' }, year: { $year: '$startDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const categoryBreakdown = await TrainingEvent.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalEvents, totalUsers, totalRegistrations, totalAttendance, completedEvents, upcomingEvents },
        recentRegistrations,
        upcomingEventsList,
        eventsByMonth,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Attendance report
// @route   GET /api/reports/attendance
// @access  Admin
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.query;
    const query = {};
    if (eventId) query.event = eventId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'name email department employeeId')
      .populate('event', 'title startDate category')
      .sort({ date: -1 });

    const summary = await Attendance.aggregate([
      ...(eventId ? [{ $match: { event: require('mongoose').Types.ObjectId.createFromHexString(eventId) } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { records: attendance, summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Employee participation report
// @route   GET /api/reports/participation
// @access  Admin
const getParticipationReport = async (req, res) => {
  try {
    const report = await Registration.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      { $unwind: '$employeeData' },
      {
        $group: {
          _id: '$employee',
          name: { $first: '$employeeData.name' },
          email: { $first: '$employeeData.email' },
          department: { $first: '$employeeData.department' },
          totalRegistrations: { $sum: 1 }
        }
      },
      { $sort: { totalRegistrations: -1 } }
    ]);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Training completion report
// @route   GET /api/reports/completion
// @access  Admin
const getCompletionReport = async (req, res) => {
  try {
    const events = await TrainingEvent.find({ status: 'Completed' })
      .populate('trainers', 'name')
      .sort({ endDate: -1 });

    const report = await Promise.all(events.map(async (event) => {
      const totalReg = await Registration.countDocuments({ event: event._id, status: 'Confirmed' });
      const present = await Attendance.countDocuments({ event: event._id, status: { $in: ['Present', 'Late'] } });
      const avgFeedback = await Feedback.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: null, avg: { $avg: '$overallRating' }, count: { $sum: 1 } } }
      ]);

      return {
        event: { _id: event._id, title: event.title, category: event.category, startDate: event.startDate, endDate: event.endDate, trainers: event.trainers },
        registrations: totalReg,
        attendance: present,
        attendanceRate: totalReg > 0 ? ((present / totalReg) * 100).toFixed(1) : 0,
        avgRating: avgFeedback[0]?.avg?.toFixed(1) || 'N/A',
        feedbackCount: avgFeedback[0]?.count || 0
      };
    }));

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Feedback analysis
// @route   GET /api/reports/feedback
// @access  Admin
const getFeedbackAnalysis = async (req, res) => {
  try {
    const overall = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgTrainer: { $avg: '$trainerRating' },
          avgContent: { $avg: '$contentRating' },
          totalResponses: { $sum: 1 },
          wouldRecommend: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    const byEvent = await Feedback.aggregate([
      {
        $lookup: { from: 'trainingevents', localField: 'event', foreignField: '_id', as: 'eventData' }
      },
      { $unwind: '$eventData' },
      {
        $group: {
          _id: '$event',
          eventTitle: { $first: '$eventData.title' },
          avgRating: { $avg: '$overallRating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    res.json({ success: true, data: { overall: overall[0], byEvent } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer report
// @route   GET /api/reports/trainers
// @access  Admin
const getTrainerReport = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', isActive: true });
    const report = await Promise.all(trainers.map(async (trainer) => {
      const assignedEvents = await TrainingEvent.countDocuments({ trainers: trainer._id });
      const completedEvents = await TrainingEvent.countDocuments({ trainers: trainer._id, status: 'Completed' });
      const feedbacks = await Feedback.aggregate([
        { $match: { trainer: trainer._id } },
        { $group: { _id: null, avgRating: { $avg: '$trainerRating' }, count: { $sum: 1 } } }
      ]);
      return {
        trainer: { _id: trainer._id, name: trainer.name, email: trainer.email, department: trainer.department },
        assignedEvents,
        completedEvents,
        avgRating: feedbacks[0]?.avgRating?.toFixed(1) || 'N/A',
        feedbackCount: feedbacks[0]?.count || 0
      };
    }));

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAttendanceReport, getParticipationReport, getCompletionReport, getFeedbackAnalysis, getTrainerReport };
