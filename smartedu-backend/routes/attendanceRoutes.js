const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', requireAuth, requireRole('ADMIN', 'TEACHER'), attendanceController.markAttendance);
router.get('/', requireAuth, requireRole('ADMIN', 'TEACHER'), attendanceController.getAllAttendance);
router.get('/student/:studentId', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), attendanceController.getAttendanceByStudent);
router.put('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), attendanceController.updateAttendance);
router.put('/:id/approve', requireAuth, requireRole('ADMIN'), attendanceController.approveAttendance);
router.put('/:id/reject', requireAuth, requireRole('ADMIN'), attendanceController.rejectAttendance);
router.delete('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), attendanceController.deleteAttendance);

module.exports = router;
