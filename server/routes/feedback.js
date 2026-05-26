const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, getEventFeedbackSummary, getMyFeedback, checkFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyFeedback);
router.get('/check/:eventId', checkFeedback);
router.get('/event/:eventId/summary', authorize('admin', 'trainer'), getEventFeedbackSummary);
router.route('/')
  .get(authorize('admin'), getAllFeedback)
  .post(authorize('employee'), submitFeedback);

module.exports = router;
