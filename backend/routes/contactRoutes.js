const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { listContacts, createContact, updateContact, deleteContact } = require('../controllers/contactController');

router.use(requireAuth);
router.get('/', listContacts);
router.post('/', requireRole('auditor', 'partner', 'admin'), createContact);
router.put('/:id', requireRole('auditor', 'partner', 'admin'), updateContact);
router.delete('/:id', requireRole('auditor', 'partner', 'admin'), deleteContact);

module.exports = router;
