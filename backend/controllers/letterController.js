const RequestItem = require('../models/RequestItem');
const LetterDraft = require('../models/LetterDraft');
const { buildMrl, buildManagementLetter } = require('../utils/letterTemplates');

async function generateLetter(req, res) {
  const { type } = req.params;
  const { engagementId } = req.query;
  if (!['mrl', 'management'].includes(type)) {
    return res.status(400).json({ message: 'invalid letter type' });
  }

  let items;
  let content;
  if (type === 'mrl') {
    items = await RequestItem.find({ engagementId, status: 'cannot_provide' });
    content = buildMrl(items);
  } else {
    items = await RequestItem.find({ engagementId, status: { $in: ['cannot_provide', 'rejected'] } });
    content = buildManagementLetter(items);
  }

  let draft = await LetterDraft.findOne({ engagementId, type, status: 'draft' });
  if (draft) {
    draft.content = content;
    await draft.save();
  } else {
    draft = await LetterDraft.create({ engagementId, type, content, status: 'draft' });
  }

  res.json({ letter: draft });
}

async function updateLetter(req, res) {
  const { content } = req.body;
  const draft = await LetterDraft.findById(req.params.id);
  if (!draft) return res.status(404).json({ message: 'letter not found' });
  if (draft.status === 'final') return res.status(400).json({ message: 'cannot edit a finalized letter' });
  draft.content = content;
  await draft.save();
  res.json({ letter: draft });
}

async function finalizeLetter(req, res) {
  const draft = await LetterDraft.findById(req.params.id);
  if (!draft) return res.status(404).json({ message: 'letter not found' });
  draft.status = 'final';
  await draft.save();
  res.json({ letter: draft });
}

module.exports = { generateLetter, updateLetter, finalizeLetter };
