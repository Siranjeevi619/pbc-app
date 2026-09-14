const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateSamples, calculateSize } = require('../controllers/sampleController');

router.use(requireAuth);
router.post('/calculate', requireRole('auditor', 'partner', 'admin'), calculateSize);
router.post('/generate', requireRole('auditor', 'partner', 'admin'), generateSamples);

module.exports = router;
