const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateSamples } = require('../controllers/sampleController');

router.use(requireAuth);
router.post('/generate', requireRole('auditor', 'partner', 'admin'), generateSamples);

module.exports = router;
