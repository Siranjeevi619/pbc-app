const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listEngagements,
  createEngagement,
  getEngagement,
  updateSchedule
} = require('../controllers/engagementController');

router.use(requireAuth);
router.get('/', listEngagements);
router.post('/', requireRole('auditor', 'partner', 'admin'), createEngagement);
router.get('/:id', getEngagement);
router.put('/:id/schedule', requireRole('auditor', 'partner', 'admin'), updateSchedule);

module.exports = router;
