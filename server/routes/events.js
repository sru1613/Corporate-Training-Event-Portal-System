const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventStats, getMyEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('admin'), getEventStats);
router.get('/my-events', authorize('trainer', 'admin'), getMyEvents);
router.route('/')
  .get(getAllEvents)
  .post(authorize('admin'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(authorize('admin'), updateEvent)
  .delete(authorize('admin'), deleteEvent);

module.exports = router;
