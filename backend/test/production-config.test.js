const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('../server');

const validProductionEnvironment = {
  NODE_ENV: 'production',
  JWT_SECRET: 'a'.repeat(32),
  ADMIN_EMAIL: 'admin@example.edu',
  ADMIN_PASSWORD: 'secure-admin-password',
  CAMPUS_EMAIL_DOMAIN: 'example.edu',
  MONGODB_URI: 'mongodb+srv://example.invalid/saanjha',
  SMTP_SERVICE: 'gmail',
  SMTP_USER: 'smtp-user@example.com',
  SMTP_PASS: 'smtp-password'
};

test('production configuration accepts required database and OTP settings', () => {
  assert.doesNotThrow(() => app.validateProductionConfig(validProductionEnvironment));
});

test('production configuration rejects missing MongoDB URI', () => {
  const environment = { ...validProductionEnvironment };
  delete environment.MONGODB_URI;

  assert.throws(
    () => app.validateProductionConfig(environment),
    /Missing required production configuration: MONGODB_URI/
  );
});

test('production configuration rejects incomplete SMTP settings', () => {
  const environment = { ...validProductionEnvironment };
  delete environment.SMTP_SERVICE;
  delete environment.SMTP_HOST;
  delete environment.SMTP_PORT;

  assert.throws(
    () => app.validateProductionConfig(environment),
    /Production OTP delivery requires SMTP_USER/
  );
});

test('production configuration rejects an invalid SMTP port', () => {
  const environment = { ...validProductionEnvironment };
  delete environment.SMTP_SERVICE;
  environment.SMTP_HOST = 'smtp.example.com';
  environment.SMTP_PORT = 'not-a-port';

  assert.throws(
    () => app.validateProductionConfig(environment),
    /Production OTP delivery requires SMTP_USER/
  );
});
