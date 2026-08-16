const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/pending', requireAuth, requireRole('ADMIN'), approvalController.getPendingApprovals);
router.put('/approve-all', requireAuth, requireRole('ADMIN'), approvalController.approveAllPending);
router.put('/reject-all', requireAuth, requireRole('ADMIN'), approvalController.rejectAllPending);

module.exports = router;
