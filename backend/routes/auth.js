const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');
const { generateOtp, hashOtp, verifyOtpHash, canSendAgain, sendOtpEmail } = require('../services/otp');
const { getPasswordError } = require('../services/passwordRules');

const router = express.Router();
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const registrationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many registration attempts. Please try again later.'
});
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.'
});
const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Too many verification attempts. Please try again later.'
});

router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, college, studentId } = req.body;
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof college !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !college.trim()
    ) {
      return res.status(400).json({ message: 'Name, campus email, password, and college are required' });
    }
    const passwordError = getPasswordError(password);
    if (passwordError) return res.status(400).json({ message: passwordError });
    const normalizedEmail = email.trim().toLowerCase();
    const campusEmailDomain = process.env.CAMPUS_EMAIL_DOMAIN || 'chitkara.edu.in';
    if (!/^[^\s@]+@[^\s@]+$/.test(normalizedEmail) || !normalizedEmail.endsWith(`@${campusEmailDomain}`)) {
      return res.status(400).json({ message: `Use your @${campusEmailDomain} campus email` });
    }
    const normalizedStudentId = typeof studentId === 'string' ? studentId.trim() : undefined;
    const duplicateQuery = [{ email: normalizedEmail }];
    if (normalizedStudentId) duplicateQuery.push({ studentId: normalizedStudentId });
    if (await User.findOne({ $or: duplicateQuery })) {
      return res.status(400).json({ message: 'Email or student ID is already registered' });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      college: college.trim(),
      studentId: normalizedStudentId,
      role: 'student'
    });
    const { code, expiresAt } = generateOtp();
    user.otpCodeHash = await hashOtp(code);
    user.otpExpiresAt = expiresAt;
    user.otpLastSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();
    const delivery = await sendOtpEmail(user.email, code);
    res.status(201).json({
      message: 'Student registered. Verification code sent.',
      otpRequired: true,
      email: user.email,
      devFallback: !!delivery.fallbackLogged,
      expiresAt
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or student ID is already registered' });
    }
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message || 'Registration failed' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !user.isActive || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.role === 'admin') {
    return res.json({ message: 'Admin login successful', token: generateToken(user._id), user });
  }
  if (!canSendAgain(user.otpLastSentAt)) return res.status(429).json({ message: 'Please wait before requesting another code' });
  const { code, expiresAt } = generateOtp();
  user.otpCodeHash = await hashOtp(code);
  user.otpExpiresAt = expiresAt;
  user.otpLastSentAt = new Date();
  user.otpAttempts = 0;
  await user.save();
  const delivery = await sendOtpEmail(user.email, code);
  res.json({ message: 'Verification code sent', otpRequired: true, email: user.email, devFallback: !!delivery.fallbackLogged, expiresAt });
});

router.post('/verify-otp', otpLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!/^\d{4}$/.test(String(code || ''))) {
    return res.status(400).json({ message: 'Verification code must be 4 digits' });
  }
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }
  if (user.otpAttempts >= 5) {
    return res.status(429).json({ message: 'Too many invalid verification attempts. Request a new code.' });
  }
  if (!user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt < new Date() || !(await verifyOtpHash(code, user.otpCodeHash))) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }
  user.otpCodeHash = null;
  user.otpExpiresAt = null;
  user.otpAttempts = 0;
  user.lastLogin = new Date();
  await user.save();
  res.json({ message: 'Login successful', token: generateToken(user._id), user });
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

router.put('/profile', auth, async (req, res) => {
  ['name', 'phone', 'college'].forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ user: req.user });
});

module.exports = router;