const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  listItems,
  getStats,
  createItem,
  submitItem,
  cannotProvideItem,
  reviewItem
} = require('../controllers/itemController');

router.use(requireAuth);
router.get('/', listItems);
router.get('/stats', getStats);
router.post('/', requireRole('auditor', 'partner', 'admin'), createItem);
router.post('/:id/submit', upload.single('file'), submitItem);
router.post('/:id/cannot-provide', cannotProvideItem);
router.post('/:id/review', requireRole('auditor', 'partner', 'admin'), reviewItem);

module.exports = router;
