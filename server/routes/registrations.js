const express = require('express');
const router = express.Router();
const { registerForEvent, getAllRegistrations, getMyRegistrations, cancelRegistration, getEventParticipants } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyRegistrations);
router.get('/event/:eventId/participants', authorize('admin', 'trainer'), getEventParticipants);
router.route('/')
  .get(authorize('admin'), getAllRegistrations)
  .post(authorize('employee', 'admin'), registerForEvent);

router.put('/:id/cancel', cancelRegistration);

module.exports = router;
