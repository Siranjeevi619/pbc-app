const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, contactId: user.contactId || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
