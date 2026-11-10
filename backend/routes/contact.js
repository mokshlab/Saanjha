const express = require('express');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (![name, email, subject, message].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (name.length > 80 || email.length > 254 || subject.length > 120 || message.length > 3000) {
      return res.status(400).json({ message: 'One or more fields exceed the allowed length.' });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Contact submission failed:', error.message);
    return res.status(500).json({ message: 'Unable to send your message right now.' });
  }
});

module.exports = router;
