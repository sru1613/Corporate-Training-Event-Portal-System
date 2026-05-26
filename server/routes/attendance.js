const express = require('express');
const router = express.Router();
const { markAttendance, bulkMarkAttendance, getEventAttendance, getMyAttendance, getAttendanceStats } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyAttendance);
router.post('/bulk', authorize('trainer', 'admin'), bulkMarkAttendance);
router.get('/event/:eventId', authorize('trainer', 'admin'), getEventAttendance);
router.get('/event/:eventId/stats', authorize('trainer', 'admin'), getAttendanceStats);
router.post('/', authorize('trainer', 'admin'), markAttendance);

module.exports = router;
