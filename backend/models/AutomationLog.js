const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engagement', required: true },
  type: { type: String, enum: ['internal_digest', 'client_eod'], required: true },
  recipient: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RequestItem' }]
}, { timestamps: true });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
