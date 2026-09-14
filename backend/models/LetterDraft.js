const mongoose = require('mongoose');

const letterDraftSchema = new mongoose.Schema({
  engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engagement', required: true },
  type: { type: String, enum: ['mrl', 'management'], required: true },
  content: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'final'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('LetterDraft', letterDraftSchema);
