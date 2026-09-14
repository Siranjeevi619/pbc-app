const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Contact = require('../models/Contact');
const { signToken } = require('../utils/jwt');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'email already in use' });

  let contactId = null;
  if (role === 'client') {
    const contact = await Contact.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
    if (!contact) {
      return res.status(400).json({ message: 'no client contact found for this email — ask your auditor to add you as a contact first' });
    }
    contactId = contact._id;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role, contactId });
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, contactId: user.contactId } });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, contactId: user.contactId } });
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'user not found' });
  res.json({ user });
}

module.exports = { register, login, me };
