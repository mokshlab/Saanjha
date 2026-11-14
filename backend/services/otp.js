const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

function generateOtp() {
  const code = crypto.randomInt(1000, 10000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { code, expiresAt };
}

async function hashOtp(code) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
}

async function verifyOtpHash(code, hash) {
  return bcrypt.compare(code, hash || '');
}

function canSendAgain(lastSentAt, minIntervalMs = 60 * 1000) {
  if (!lastSentAt) return true;
  return Date.now() - new Date(lastSentAt).getTime() >= minIntervalMs;
}

function validateProductionOtpConfig(environment = process.env) {
  if (environment.NODE_ENV !== 'production') return;

  const hasCredentials = Boolean(environment.SMTP_USER && environment.SMTP_PASS);
  const hasService = Boolean(environment.SMTP_SERVICE);
  const smtpPort = Number(environment.SMTP_PORT);
  const hasHost = Boolean(
    environment.SMTP_HOST &&
    Number.isInteger(smtpPort) &&
    smtpPort > 0 &&
    smtpPort <= 65535
  );

  if (!hasCredentials || (!hasService && !hasHost)) {
    throw new Error(
      'Production OTP delivery requires SMTP_USER, SMTP_PASS, and either SMTP_SERVICE or SMTP_HOST with SMTP_PORT'
    );
  }
}

function buildTransport(environment = process.env) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SERVICE,
    SMTP_SECURE,
    SMTP_ALLOW_INSECURE
  } = environment;

  if (!SMTP_USER || !SMTP_PASS) {
    return null; // Use console fallback
  }

  // Prefer well-known service config if provided (e.g., 'gmail', 'outlook')
  if (SMTP_SERVICE) {
    const transport = nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      secure: SMTP_SECURE === 'true' || SMTP_SERVICE.toLowerCase() === 'gmail',
      tls: SMTP_ALLOW_INSECURE === 'true' ? { rejectUnauthorized: false } : undefined
    });
    return transport;
  }

  if (!SMTP_HOST || !SMTP_PORT) {
    return null; // Missing host/port when no service specified
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: SMTP_ALLOW_INSECURE === 'true' ? { rejectUnauthorized: false } : undefined
  });
}

async function sendOtpEmail(to, code) {
  validateProductionOtpConfig();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Saanjha OTP] ${to}: ${code}`);
  }

  const fromCandidate = process.env.OTP_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@saanjha.local';
  const from = /</.test(fromCandidate) ? fromCandidate : `Saanjha <${fromCandidate}>`;
  const transport = buildTransport();

  const subject = 'Your Saanjha verification code';
  const text = `Your verification code is ${code}. It expires in 10 minutes.`;
  const html = `<p>Your verification code is <b>${code}</b>.</p><p>It expires in 10 minutes.</p>`;

  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production OTP delivery is unavailable because SMTP is not configured');
    }
    console.log('Configure SMTP to send real emails: set SMTP_SERVICE or SMTP_HOST/SMTP_PORT with SMTP_USER/SMTP_PASS');
    return { success: true, fallbackLogged: true };
  }

  try {
    await transport.sendMail({ from, to, subject, text, html });
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`OTP email delivery failed: ${error.message}`);
    }
    console.warn(`OTP email delivery failed for ${to}: ${error.message}`);
    return { success: true, fallbackLogged: true, deliveryError: error.message };
  }
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  canSendAgain,
  validateProductionOtpConfig,
  sendOtpEmail
};