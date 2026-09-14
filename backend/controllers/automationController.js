const RequestItem = require("../models/RequestItem");
const AutomationLog = require("../models/AutomationLog");
const Engagement = require("../models/Engagement");
const {
  buildEodBody,
  sendClientReminder,
  sendInternalDigest,
} = require("../utils/automation");

async function previewAutomation(req, res) {
  const { engagementId, type } = req.query;
  if (type === "client_eod") {
    const outstanding = await RequestItem.find({
      engagementId,
      status: { $in: ["pending", "rejected"] },
      dueDate: { $lt: new Date() },
    }).populate("contactId");

    const grouped = {};
    for (const item of outstanding) {
      const key = String(item.contactId._id);
      if (!grouped[key]) grouped[key] = { contact: item.contactId, items: [] };
      grouped[key].items.push(item);
    }

    const drafts = Object.values(grouped).map((g) => ({
      contactId: g.contact._id,
      contactName: g.contact.name,
      contactEmail: g.contact.email,
      overdueCount: g.items.length,
      subject: "End-of-day check — pending audit requirements",
      body: buildEodBody(g.contact, g.items),
      itemIds: g.items.map((i) => i._id),
    }));

    return res.json({ drafts });
  }

  return res.json({ drafts: [] });
}

async function sendAutomation(req, res) {
  const { engagementId, contactId, type } = req.body;
  if (type === "client_eod") {
    const result = await sendClientReminder(engagementId, contactId);
    if (!result)
      return res.status(400).json({ message: "nothing outstanding to send" });
    return res.json({ log: result.log });
  }
  if (type === "internal_digest") {
    const engagement = await Engagement.findById(engagementId);
    const result = await sendInternalDigest(
      engagementId,
      engagement.auditTeamEmail,
    );
    if (!result) return res.status(400).json({ message: "nothing to send" });
    return res.json({ log: result.log });
  }
  return res.status(400).json({ message: "unknown automation type" });
}

async function getAutomationLog(req, res) {
  const filter = {};
  if (req.query.engagementId) filter.engagementId = req.query.engagementId;
  const logs = await AutomationLog.find(filter).sort({ sentAt: -1 });
  res.json({ logs });
}

module.exports = { previewAutomation, sendAutomation, getAutomationLog };
