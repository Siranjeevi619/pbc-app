const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { listContacts, createContact } = require('../controllers/contactController');

router.use(requireAuth);
router.get('/', listContacts);
router.post('/', requireRole('auditor', 'partner', 'admin'), createContact);

module.exports = router;
