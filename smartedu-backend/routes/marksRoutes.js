const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', requireAuth, requireRole('ADMIN', 'TEACHER'), marksController.addMarks);
router.get('/', requireAuth, requireRole('ADMIN', 'TEACHER'), marksController.getAllMarks);
router.get('/student/:studentId', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), marksController.getMarksByStudent);
router.put('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), marksController.updateMarks);
router.put('/:id/approve', requireAuth, requireRole('ADMIN'), marksController.approveMarks);
router.put('/:id/reject', requireAuth, requireRole('ADMIN'), marksController.rejectMarks);
router.delete('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), marksController.deleteMarks);

module.exports = router;
