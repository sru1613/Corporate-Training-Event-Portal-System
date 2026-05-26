const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');
const TrainingEvent = require('../models/TrainingEvent');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Employee
const submitFeedback = async (req, res) => {
  try {
    const { eventId, trainerId, trainerRating, contentRating, overallRating, comments, suggestions, wouldRecommend } = req.body;

    // Check event exists and has ended
    const event = await TrainingEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after the event has ended' });
    }

    // Check if registered
    const registration = await Registration.findOne({ event: eventId, employee: req.user._id });
    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must be registered for this event to submit feedback' });
    }

    const existing = await Feedback.findOne({ event: eventId, employee: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this event' });
    }

    const feedback = await Feedback.create({
      event: eventId,
      employee: req.user._id,
      trainer: trainerId,
      trainerRating,
      contentRating,
      overallRating,
      comments,
      suggestions,
      wouldRecommend
    });

    await feedback.populate([
      { path: 'event', select: 'title' },
      { path: 'employee', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this event' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
// @access  Admin
const getAllFeedback = async (req, res) => {
  try {
    const { eventId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (eventId) query.event = eventId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const feedbacks = await Feedback.find(query)
      .populate('event', 'title startDate')
      .populate('employee', 'name email department')
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);
    res.json({
      success: true,
      data: feedbacks,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event feedback summary
// @route   GET /api/feedback/event/:eventId/summary
// @access  Admin / Trainer
const getEventFeedbackSummary = async (req, res) => {
  try {
    const summary = await Feedback.aggregate([
      { $match: { event: require('mongoose').Types.ObjectId.createFromHexString(req.params.eventId) } },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgTrainer: { $avg: '$trainerRating' },
          avgContent: { $avg: '$contentRating' },
          count: { $sum: 1 },
          wouldRecommend: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
        }
      }
    ]);

    const distribution = await Feedback.aggregate([
      { $match: { event: require('mongoose').Types.ObjectId.createFromHexString(req.params.eventId) } },
      { $group: { _id: '$overallRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: { summary: summary[0] || {}, distribution } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my feedback
// @route   GET /api/feedback/my
// @access  Employee
const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ employee: req.user._id })
      .populate('event', 'title startDate category')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if feedback submitted
// @route   GET /api/feedback/check/:eventId
// @access  Employee
const checkFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ event: req.params.eventId, employee: req.user._id });
    res.json({ success: true, submitted: !!feedback, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitFeedback, getAllFeedback, getEventFeedbackSummary, getMyFeedback, checkFeedback };
