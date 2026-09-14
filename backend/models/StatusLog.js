const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema({
  requestItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestItem', required: true },
  fromStatus: { type: String, default: '' },
  toStatus: { type: String, required: true },
  actor: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StatusLog', statusLogSchema);
