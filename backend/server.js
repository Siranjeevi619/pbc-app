require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const startScheduler = require('./scheduler');

const authRoutes = require('./routes/authRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const contactRoutes = require('./routes/contactRoutes');
const itemRoutes = require('./routes/itemRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const automationRoutes = require('./routes/automationRoutes');
const letterRoutes = require('./routes/letterRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/engagements', engagementRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/letters', letterRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
  startScheduler();
});
