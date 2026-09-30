const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  listItems,
  getStats,
  createItem,
  submitItem,
  getItemFile,
  cannotProvideItem,
  reviewItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

router.use(requireAuth);
router.get('/', listItems);
router.get('/stats', getStats);
router.get('/:id/file', getItemFile);
router.post('/', requireRole('auditor', 'partner', 'admin'), createItem);
router.put('/:id', requireRole('auditor', 'partner', 'admin'), updateItem);
router.delete('/:id', requireRole('auditor', 'partner', 'admin'), deleteItem);
router.post('/:id/submit', upload.single('file'), submitItem);
router.post('/:id/cannot-provide', cannotProvideItem);
router.post('/:id/review', requireRole('auditor', 'partner', 'admin'), reviewItem);

module.exports = router;
