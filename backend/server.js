const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '..', '.local', '.env') });

const app = express();
const PORT = process.env.PORT || 3101;
let memoryServer = null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'Saanjha API is running' }));

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saanjha');
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB unavailable; starting development in-memory database:', error.message);
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri('saanjha'));
  }
  await ensureAdmin();
}

async function ensureAdmin() {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) return;
  await User.create({
    name: 'Saanjha Campus Steward',
    email: process.env.ADMIN_EMAIL || 'admin@university.edu.in',
    password: process.env.ADMIN_PASSWORD || 'change-this-before-demo',
    role: 'admin',
    college: process.env.CAMPUS_NAME || 'Example University'
  });
  console.log('Seeded the initial Saanjha administrator');
}

async function startServer() {
  await connectDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Saanjha API listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Database startup failed:', error.message);
  process.exitCode = 1;
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  process.exit(0);
});

module.exports = app;