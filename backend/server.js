const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const reservationRoutes = require('./routes/reservations');
const { validateProductionOtpConfig } = require('./services/otp');

dotenv.config({ path: path.join(__dirname, '..', '.local', '.env') });

const app = express();
const PORT = process.env.PORT || 3101;
let memoryServer = null;
let reservationExpiryTimer = null;

function validateProductionConfig(environment = process.env) {
  if (environment.NODE_ENV !== 'production') return;

  const required = [
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'CAMPUS_EMAIL_DOMAIN',
    'MONGODB_URI'
  ];
  const missing = required.filter((name) => !environment[name]);
  if (missing.length) {
    throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  }
  if (environment.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  validateProductionOtpConfig(environment);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

app.get('/', (req, res) => res.json({ message: 'Saanjha API is running' }));

async function connectDatabase() {
  validateProductionConfig();
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saanjha');
    console.log('MongoDB connected');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Production MongoDB connection failed: ${error.message}`);
    }
    console.warn('MongoDB unavailable; starting development in-memory database:', error.message);
    memoryServer = await MongoMemoryReplSet.create({
      replSet: { count: 1 }
    });
    await mongoose.connect(memoryServer.getUri('saanjha'));
  }
  await ensureAdmin();
  await reservationRoutes.expireReservations();
  reservationExpiryTimer = setInterval(() => reservationRoutes.expireReservations().catch((error) => {
    console.error('Reservation expiry failed:', error.message);
  }), 60 * 1000);
  reservationExpiryTimer.unref();
}

async function ensureAdmin() {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) return;
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD is not configured; initial administrator was not seeded');
    return;
  }
  await User.create({
    name: 'Saanjha Campus Steward',
    email: process.env.ADMIN_EMAIL || 'admin@chitkara.edu.in',
    password: process.env.ADMIN_PASSWORD,
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

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Database startup failed:', error.message);
    process.exitCode = 1;
  });
}

process.on('SIGINT', async () => {
  if (reservationExpiryTimer) clearInterval(reservationExpiryTimer);
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  process.exit(0);
});

module.exports = app;
module.exports.validateProductionConfig = validateProductionConfig;