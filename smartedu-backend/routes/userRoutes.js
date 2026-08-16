const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/students/unassigned', requireAuth, requireRole('ADMIN', 'TEACHER'), userController.getUnassignedStudents);
router.put('/:id', requireAuth, requireRole('ADMIN', 'TEACHER', 'STUDENT'), userController.updateUser);

module.exports = router;
