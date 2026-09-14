const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { previewAutomation, sendAutomation, getAutomationLog } = require('../controllers/automationController');

router.use(requireAuth, requireRole('auditor', 'partner', 'admin'));
router.get('/preview', previewAutomation);
router.post('/send', sendAutomation);
router.get('/log', getAutomationLog);

module.exports = router;
