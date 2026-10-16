const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -otpCodeHash');
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account is not active' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

const studentAuth = (req, res, next) => {
  if (req.user?.role !== 'student') return res.status(403).json({ message: 'Student access required' });
  next();
};

module.exports = { auth, adminAuth, studentAuth };