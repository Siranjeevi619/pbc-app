const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  engagementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engagement', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
