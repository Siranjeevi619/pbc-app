const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const RequestItem = require('../models/RequestItem');
const StatusLog = require('../models/StatusLog');
const Contact = require('../models/Contact');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

async function listItems(req, res) {
  const filter = {};
  if (req.query.engagementId) filter.engagementId = req.query.engagementId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  if (req.user.role === 'client') {
    filter.contactId = req.user.contactId;
  } else if (req.query.contactId) {
    filter.contactId = req.query.contactId;
  }

  const items = await RequestItem.find(filter).select('-fileData').populate('contactId').sort({ dueDate: 1 });
  res.json({ items });
}

async function getStats(req, res) {
  const engagementId = req.query.engagementId;
  const filter = engagementId ? { engagementId } : {};
  const items = await RequestItem.find(filter);
  const now = new Date();
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    submitted: items.filter(i => i.status === 'submitted').length,
    cannotProvide: items.filter(i => i.status === 'cannot_provide').length,
    overdue: items.filter(i => ['pending', 'rejected'].includes(i.status) && i.dueDate < now).length
  };
  res.json({ stats });
}

async function createItem(req, res) {
  const { engagementId, contactId, type, name, category, dueDate, sampleRefs } = req.body;
  if (!engagementId || !contactId || !type || !name || !dueDate) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  const item = await RequestItem.create({
    engagementId,
    contactId,
    type,
    name,
    category: category || '',
    dueDate,
    sampleRefs: sampleRefs || [],
    status: 'pending'
  });
  await StatusLog.create({ requestItemId: item._id, fromStatus: '', toStatus: 'pending', actor: req.user.id });
  res.status(201).json({ item });
}

async function submitItem(req, res) {
  const item = await RequestItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'item not found' });

  if (req.user.role === 'client' && String(item.contactId) !== String(req.user.contactId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const fileRef = req.file ? `/api/items/${item._id}/file` : req.body.fileRef;
  if (!fileRef) return res.status(400).json({ message: 'file is required' });

  const fromStatus = item.status;
  item.fileRef = fileRef;
  if (req.file) {
    item.fileData = await gzip(req.file.buffer);
    item.fileName = req.file.originalname;
    item.fileContentType = req.file.mimetype || 'application/octet-stream';
  }
  item.status = 'submitted';
  item.reasonCode = null;
  item.justification = '';
  await item.save();
  await StatusLog.create({ requestItemId: item._id, fromStatus, toStatus: 'submitted', actor: req.user.id });
  res.json({ item });
}

async function getItemFile(req, res) {
  const item = await RequestItem.findById(req.params.id).select('+fileData');
  if (!item) return res.status(404).json({ message: 'item not found' });

  if (req.user.role === 'client' && String(item.contactId) !== String(req.user.contactId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (item.fileData && item.fileData.length) {
    const file = await gunzip(item.fileData);
    res.set({
      'Content-Type': item.fileContentType || 'application/octet-stream',
      'Content-Length': file.length,
      'Content-Disposition': `inline; filename="${encodeURIComponent(item.fileName || 'uploaded-file')}"`
    });
    return res.send(file);
  }

  if (item.fileRef && item.fileRef.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', item.fileRef);
    return res.sendFile(filePath, err => {
      if (err && !res.headersSent) res.status(err.statusCode || 404).json({ message: 'file not found' });
    });
  }

  return res.status(404).json({ message: 'file not found' });
}

async function cannotProvideItem(req, res) {
  const { reasonCode, justification } = req.body;
  if (!reasonCode || !justification || !justification.trim()) {
    return res.status(400).json({ message: 'reasonCode and justification are both required' });
  }
  const item = await RequestItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'item not found' });

  if (req.user.role === 'client' && String(item.contactId) !== String(req.user.contactId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  const fromStatus = item.status;
  item.status = 'cannot_provide';
  item.reasonCode = reasonCode;
  item.justification = justification;
  await item.save();
  await StatusLog.create({ requestItemId: item._id, fromStatus, toStatus: 'cannot_provide', actor: req.user.id });
  res.json({ item });
}

async function reviewItem(req, res) {
  const { decision, reviewNote } = req.body;
  if (!['accept', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'decision must be accept or reject' });
  }
  const item = await RequestItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'item not found' });

  const fromStatus = item.status;
  item.status = decision === 'accept' ? 'reviewed' : 'rejected';
  item.reviewNote = reviewNote || '';
  await item.save();
  await StatusLog.create({ requestItemId: item._id, fromStatus, toStatus: item.status, actor: req.user.id });
  res.json({ item });
}

async function updateItem(req, res) {
  const { name, category, dueDate, contactId } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (category !== undefined) update.category = category;
  if (dueDate !== undefined) update.dueDate = dueDate;
  if (contactId !== undefined) update.contactId = contactId;

  const item = await RequestItem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'item not found' });
  res.json({ item });
}

async function deleteItem(req, res) {
  const item = await RequestItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'item not found' });

  if (item.fileRef && item.fileRef.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', item.fileRef);
    fs.unlink(filePath, () => {});
  }

  await StatusLog.deleteMany({ requestItemId: item._id });
  await item.deleteOne();
  res.json({ message: 'item deleted' });
}

module.exports = {
  listItems,
  getStats,
  createItem,
  submitItem,
  getItemFile,
  cannotProvideItem,
  reviewItem,
  updateItem,
  deleteItem
};
