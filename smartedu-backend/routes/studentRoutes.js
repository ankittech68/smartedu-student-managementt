const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', requireAuth, requireRole('ADMIN', 'TEACHER'), studentController.createStudent);
router.get('/', requireAuth, requireRole('ADMIN', 'TEACHER'), studentController.getAllStudents);
router.get('/me', requireAuth, requireRole('STUDENT'), studentController.getMyStudentProfile);
router.get('/user/:userId', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), studentController.getStudentByUserId);
router.get('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), studentController.getStudentById);
router.put('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), studentController.updateStudent);
router.delete('/:id', requireAuth, requireRole('ADMIN'), studentController.deleteStudent);

module.exports = router;
