const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateLetter, updateLetter, finalizeLetter } = require('../controllers/letterController');

router.use(requireAuth, requireRole('auditor', 'partner', 'admin'));
router.get('/:type/generate', generateLetter);
router.put('/:id', updateLetter);
router.post('/:id/finalize', requireRole('partner'), finalizeLetter);

module.exports = router;
