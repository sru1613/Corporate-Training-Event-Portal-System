const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, sendNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/send', authorize('admin'), sendNotification);

module.exports = router;
