const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, controller.listNotifications);
router.get('/unread-count', authenticateUser, controller.unreadCount);
router.patch('/read-all', authenticateUser, controller.markAllRead);
router.patch('/:id/read', authenticateUser, controller.markRead);

module.exports = router;
