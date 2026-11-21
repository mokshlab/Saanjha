const path = require('node:path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.join(__dirname, '..', '..', '.local', '.env') });

async function verifySmtp() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SERVICE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    OTP_FROM
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('SMTP credentials are missing.');
    process.exitCode = 1;
    return;
  }

  if (!SMTP_SERVICE && (!SMTP_HOST || !SMTP_PORT)) {
    console.error('SMTP host and port are missing.');
    process.exitCode = 1;
    return;
  }

  if ((SMTP_HOST || '').toLowerCase().includes('brevo') && !(SMTP_FROM || OTP_FROM)) {
    console.error('Brevo requires SMTP_FROM or OTP_FROM set to a verified sender email.');
    process.exitCode = 1;
    return;
  }

  const transport = SMTP_SERVICE
    ? nodemailer.createTransport({
        service: SMTP_SERVICE,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      })
    : nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      });

  try {
    await transport.verify();
    console.log('Brevo SMTP connection verified.');
  } catch (error) {
    console.error(`SMTP verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

verifySmtp();
