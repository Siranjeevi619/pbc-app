const Engagement = require('./models/Engagement');
const Contact = require('./models/Contact');
const { sendClientReminder, sendInternalDigest } = require('./utils/automation');

function currentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function runTick() {
  const nowTime = currentTime();
  const engagements = await Engagement.find();

  for (const engagement of engagements) {
    const schedule = engagement.automationSchedule || {};

    if (schedule.internalTime === nowTime && engagement.auditTeamEmail) {
      await sendInternalDigest(engagement._id, engagement.auditTeamEmail);
    }

    if (schedule.clientTime === nowTime) {
      const contacts = await Contact.find({ engagementId: engagement._id });
      for (const contact of contacts) {
        await sendClientReminder(engagement._id, contact._id);
      }
    }
  }
}

function startScheduler() {
  setInterval(() => {
    runTick().catch(err => console.error('scheduler tick failed', err));
  }, 60 * 1000);
}

module.exports = startScheduler;
