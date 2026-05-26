const Registration = require('../models/Registration');
const TrainingEvent = require('../models/TrainingEvent');
const Notification = require('../models/Notification');

// @desc    Register for event
// @route   POST /api/registrations
// @access  Employee
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await TrainingEvent.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot register for a cancelled event' });
    }
    if (event.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'This training event has already been completed' });
    }

    const existing = await Registration.findOne({ event: eventId, employee: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You are already registered for this event' });

    let status = 'Confirmed';
    if (event.currentParticipants >= event.maxParticipants) {
      status = 'Waitlisted';
    }

    const registration = await Registration.create({
      event: eventId,
      employee: req.user._id,
      status
    });

    if (status === 'Confirmed') {
      await TrainingEvent.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });
    }

    // Send confirmation notification
    await Notification.create({
      recipient: req.user._id,
      type: 'REGISTRATION_CONFIRMED',
      title: status === 'Confirmed' ? 'Registration Confirmed' : 'Added to Waitlist',
      message: status === 'Confirmed'
        ? `Your registration for "${event.title}" has been confirmed.`
        : `You have been added to the waitlist for "${event.title}".`,
      relatedEvent: eventId
    });

    await registration.populate([
      { path: 'event', select: 'title startDate location' },
      { path: 'employee', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: `Registration ${status.toLowerCase()} successfully`, data: registration });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registrations
// @route   GET /api/registrations
// @access  Admin
const getAllRegistrations = async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (eventId) query.event = eventId;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const registrations = await Registration.find(query)
      .populate('event', 'title startDate status')
      .populate('employee', 'name email department employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(query);
    res.json({
      success: true,
      data: registrations,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Employee
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ employee: req.user._id })
      .populate('event', 'title startDate endDate location status category mode meetingLink thumbnail')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration
// @route   PUT /api/registrations/:id/cancel
// @access  Employee / Admin
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    if (req.user.role === 'employee' && registration.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Registration already cancelled' });
    }

    const wasConfirmed = registration.status === 'Confirmed';
    registration.status = 'Cancelled';
    registration.cancellationReason = req.body.reason || '';
    await registration.save();

    if (wasConfirmed) {
      await TrainingEvent.findByIdAndUpdate(registration.event, { $inc: { currentParticipants: -1 } });

      // Check waitlisted participant
      const waitlisted = await Registration.findOne({ event: registration.event, status: 'Waitlisted' }).sort({ createdAt: 1 });
      if (waitlisted) {
        waitlisted.status = 'Confirmed';
        await waitlisted.save();
        await TrainingEvent.findByIdAndUpdate(registration.event, { $inc: { currentParticipants: 1 } });
        const ev = await TrainingEvent.findById(registration.event);
        await Notification.create({
          recipient: waitlisted.employee,
          type: 'REGISTRATION_CONFIRMED',
          title: 'Registration Confirmed from Waitlist',
          message: `Great news! A spot opened up for "${ev.title}". Your registration is now confirmed.`,
          relatedEvent: registration.event
        });
      }
    }

    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event participants
// @route   GET /api/registrations/event/:eventId/participants
// @access  Admin / Trainer
const getEventParticipants = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
      status: { $in: ['Confirmed', 'Waitlisted'] }
    }).populate('employee', 'name email department designation employeeId phone');
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerForEvent, getAllRegistrations, getMyRegistrations, cancelRegistration, getEventParticipants };
