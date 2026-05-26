const express = require('express');
const router = express.Router();
const { getDashboardStats, getAttendanceReport, getParticipationReport, getCompletionReport, getFeedbackAnalysis, getTrainerReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/attendance', getAttendanceReport);
router.get('/participation', getParticipationReport);
router.get('/completion', getCompletionReport);
router.get('/feedback', getFeedbackAnalysis);
router.get('/trainers', getTrainerReport);

module.exports = router;
