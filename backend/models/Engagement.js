const mongoose = require('mongoose');

const engagementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientName: { type: String, required: true },
  fiscalYear: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  auditTeamEmail: { type: String },
  automationSchedule: {
    internalTime: { type: String, default: '09:00' },
    clientTime: { type: String, default: '17:30' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Engagement', engagementSchema);
