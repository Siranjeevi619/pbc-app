const mongoose = require('mongoose');

const requestItemSchema = new mongoose.Schema({
  engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engagement', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  type: { type: String, enum: ['document', 'sample'], required: true },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'reviewed', 'rejected', 'cannot_provide'],
    default: 'pending'
  },
  fileRef: { type: String, default: '' },
  sampleRefs: [{ type: String }],
  reasonCode: {
    type: String,
    enum: ['company_policy', 'legal_restriction', 'security_concern', 'not_available', null],
    default: null
  },
  justification: { type: String, default: '' },
  reviewNote: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('RequestItem', requestItemSchema);
