const Contact = require("../models/Contact");

async function listContacts(req, res) {
  const filter = {};
  if (req.query.engagementId) filter.engagementId = req.query.engagementId;
  const contacts = await Contact.find(filter);
  res.json({ contacts });
}

async function createContact(req, res) {
  const contact = await Contact.create(req.body);
  res.status(201).json({ contact });
}

module.exports = { listContacts, createContact };
