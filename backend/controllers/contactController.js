const Contact = require("../models/Contact");
const RequestItem = require("../models/RequestItem");

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

async function updateContact(req, res) {
  const { name, email, role } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;

  const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!contact) return res.status(404).json({ message: 'contact not found' });
  res.json({ contact });
}

async function deleteContact(req, res) {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ message: 'contact not found' });

  const itemCount = await RequestItem.countDocuments({ contactId: contact._id });
  if (itemCount > 0) {
    return res.status(409).json({ message: 'cannot delete a contact with existing request items' });
  }

  await contact.deleteOne();
  res.json({ message: 'contact deleted' });
}

module.exports = { listContacts, createContact, updateContact, deleteContact };
