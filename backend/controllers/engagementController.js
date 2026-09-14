const Engagement = require('../models/Engagement');

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

module.exports = { listEngagements, createEngagement, getEngagement, updateSchedule };
