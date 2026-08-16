const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), notificationController.getMyNotifications);
router.put('/read-all', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), notificationController.markAllAsRead);
router.put('/:id/read', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), notificationController.markAsRead);

module.exports = router;
