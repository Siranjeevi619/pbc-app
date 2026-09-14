const RequestItem = require('../models/RequestItem');
const AutomationLog = require('../models/AutomationLog');
const { sendEmail } = require('./emailer');

function daysOverdue(dueDate) {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function buildEodBody(contact, items) {
  const lines = items.map(i => `  •  ${i.name} — overdue by ${daysOverdue(i.dueDate)} days`).join('\n');
  return `Hi ${contact.name},\n\nBefore you close out today, could you check the status of the items below?\n\n${lines}\n\nThanks for keeping this moving,\nAudit Team`;
}

function buildInternalDigestBody(overdue, awaitingReview, cannotProvide) {
  const section = (title, items) => {
    if (!items.length) return '';
    return `${title}:\n` + items.map(i => `  •  ${i.name}`).join('\n') + '\n\n';
  };
  return (
    section('Overdue', overdue) +
    section('Awaiting review', awaitingReview) +
    section('Cannot provide', cannotProvide)
  ).trim();
}

async function sendClientReminder(engagementId, contactId) {
  const outstanding = await RequestItem.find({
    engagementId,
    contactId,
    status: { $in: ['pending', 'rejected'] },
    dueDate: { $lt: new Date() }
  }).populate('contactId');

  if (!outstanding.length) return null;

  const contact = outstanding[0].contactId;
  const body = buildEodBody(contact, outstanding);
  const subject = 'End-of-day check — pending audit requirements';
  await sendEmail(contact.email, subject, body);

  const log = await AutomationLog.create({
    engagementId,
    type: 'client_eod',
    recipient: contact.email,
    itemIds: outstanding.map(i => i._id)
  });

  return { log, subject, body };
}

async function sendInternalDigest(engagementId, teamEmail) {
  const now = new Date();
  const overdue = await RequestItem.find({ engagementId, status: { $in: ['pending', 'rejected'] }, dueDate: { $lt: now } });
  const awaitingReview = await RequestItem.find({ engagementId, status: 'submitted' });
  const cannotProvide = await RequestItem.find({ engagementId, status: 'cannot_provide' });

  if (!overdue.length && !awaitingReview.length && !cannotProvide.length) return null;

  const body = buildInternalDigestBody(overdue, awaitingReview, cannotProvide);
  const subject = 'Internal daily PBC digest';
  await sendEmail(teamEmail, subject, body);

  const log = await AutomationLog.create({
    engagementId,
    type: 'internal_digest',
    recipient: teamEmail,
    itemIds: [...overdue, ...awaitingReview, ...cannotProvide].map(i => i._id)
  });

  return { log, subject, body };
}

module.exports = { sendClientReminder, sendInternalDigest, buildEodBody, buildInternalDigestBody, daysOverdue };
