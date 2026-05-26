const TrainingEvent = require('../models/TrainingEvent');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getAllEvents = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10, upcoming } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (upcoming === 'true') query.startDate = { $gte: new Date() };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await TrainingEvent.find(query)
      .populate('trainers', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TrainingEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await TrainingEvent.findById(req.params.id)
      .populate('trainers', 'name email department designation')
      .populate('createdBy', 'name email');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user._id };
    const event = await TrainingEvent.create(eventData);
    await event.populate('trainers', 'name email');

    // Notify all employees about new event
    const employees = await User.find({ role: 'employee', isActive: true });
    const notifications = employees.map(emp => ({
      recipient: emp._id,
      sender: req.user._id,
      type: 'EVENT_CREATED',
      title: 'New Training Event',
      message: `A new training event "${event.title}" has been created. Register now!`,
      relatedEvent: event._id
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, message: 'Event created successfully', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
  try {
    const event = await TrainingEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('trainers', 'name email');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Notify registered employees about changes
    const registrations = await Registration.find({ event: event._id, status: 'Confirmed' });
    const notifs = registrations.map(r => ({
      recipient: r.employee,
      sender: req.user._id,
      type: 'EVENT_UPDATED',
      title: 'Event Updated',
      message: `The training event "${event.title}" has been updated. Please check for changes.`,
      relatedEvent: event._id
    }));
    if (notifs.length > 0) await Notification.insertMany(notifs);

    res.json({ success: true, message: 'Event updated successfully', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await TrainingEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await TrainingEvent.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event stats
// @route   GET /api/events/stats
// @access  Admin
const getEventStats = async (req, res) => {
  try {
    const total = await TrainingEvent.countDocuments();
    const upcoming = await TrainingEvent.countDocuments({ status: 'Upcoming', startDate: { $gte: new Date() } });
    const ongoing = await TrainingEvent.countDocuments({ status: 'Ongoing' });
    const completed = await TrainingEvent.countDocuments({ status: 'Completed' });
    const cancelled = await TrainingEvent.countDocuments({ status: 'Cancelled' });

    const byCategory = await TrainingEvent.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentEvents = await TrainingEvent.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('trainers', 'name');

    res.json({ success: true, data: { total, upcoming, ongoing, completed, cancelled, byCategory, recentEvents } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's assigned events
// @route   GET /api/events/my-events
// @access  Trainer
const getMyEvents = async (req, res) => {
  try {
    const events = await TrainingEvent.find({ trainers: req.user._id })
      .populate('trainers', 'name email')
      .sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventStats, getMyEvents };
