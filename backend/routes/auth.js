const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateOtp, hashOtp, verifyOtpHash, canSendAgain, sendOtpEmail } = require('../services/otp');

const router = express.Router();
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, college, studentId } = req.body;
    if (!name || !email || !password || !college) {
      return res.status(400).json({ message: 'Name, campus email, password, and college are required' });
    }
    const campusEmailDomain = process.env.CAMPUS_EMAIL_DOMAIN || 'university.edu.in';
    if (!email.toLowerCase().endsWith(`@${campusEmailDomain}`)) return res.status(400).json({ message: `Use your @${campusEmailDomain} campus email` });
    const duplicateQuery = [{ email: email.toLowerCase() }];
    if (studentId) duplicateQuery.push({ studentId });
    if (await User.findOne({ $or: duplicateQuery })) {
      return res.status(400).json({ message: 'Email or student ID is already registered' });
    }
    const user = await User.create({ name, email, password, phone, college, studentId, role: 'student' });
    res.status(201).json({ message: 'Student registered successfully', token: generateToken(user._id), user });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
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
  await user.save();
  const delivery = await sendOtpEmail(user.email, code);
  res.json({ message: 'Verification code sent', otpRequired: true, email: user.email, devFallback: !!delivery.fallbackLogged, expiresAt });
});

router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt < new Date() || !(await verifyOtpHash(code, user.otpCodeHash))) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }
  user.otpCodeHash = null;
  user.otpExpiresAt = null;
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