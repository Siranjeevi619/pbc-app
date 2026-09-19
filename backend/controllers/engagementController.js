const Engagement = require('../models/Engagement');
const Contact = require('../models/Contact');
const RequestItem = require('../models/RequestItem');
const StatusLog = require('../models/StatusLog');

async function listEngagements(req, res) {
  const engagements = await Engagement.find();
  res.json({ engagements });
}

async function createEngagement(req, res) {
  const engagement = await Engagement.create(req.body);
  res.status(201).json({ engagement });
}

async function getEngagement(req, res) {
  const engagement = await Engagement.findById(req.params.id);
  if (!engagement) return res.status(404).json({ message: 'engagement not found' });
  res.json({ engagement });
}

async function updateSchedule(req, res) {
  const { internalTime, clientTime } = req.body;
  const engagement = await Engagement.findByIdAndUpdate(
    req.params.id,
    { automationSchedule: { internalTime, clientTime } },
    { new: true }
  );
  if (!engagement) return res.status(404).json({ message: 'engagement not found' });
  res.json({ engagement });
}

async function updateEngagement(req, res) {
  const { name, clientName, fiscalYear, auditTeamEmail, status } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (clientName !== undefined) update.clientName = clientName;
  if (fiscalYear !== undefined) update.fiscalYear = fiscalYear;
  if (auditTeamEmail !== undefined) update.auditTeamEmail = auditTeamEmail;
  if (status !== undefined) update.status = status;

  const engagement = await Engagement.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!engagement) return res.status(404).json({ message: 'engagement not found' });
  res.json({ engagement });
}

async function deleteEngagement(req, res) {
  const engagement = await Engagement.findById(req.params.id);
  if (!engagement) return res.status(404).json({ message: 'engagement not found' });

  const items = await RequestItem.find({ engagementId: engagement._id });
  await StatusLog.deleteMany({ requestItemId: { $in: items.map(i => i._id) } });
  await RequestItem.deleteMany({ engagementId: engagement._id });
  await Contact.deleteMany({ engagementId: engagement._id });
  await engagement.deleteOne();

  res.json({ message: 'engagement deleted' });
}

module.exports = {
  listEngagements,
  createEngagement,
  getEngagement,
  updateSchedule,
  updateEngagement,
  deleteEngagement
};
