const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'workrank-secret-key';

const DEMO_USER = {
  id: '1',
  fullName: 'Azizbek',
  phone: '998901234567',
  role: 'employee',
  department: 'Montaj',
  position: 'Elektr montajchi',
  avatar: 'https://i.pravatar.cc/150?u=azizbek',
};

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Telefon va parol kerak' });
  }
  const token = jwt.sign({ userId: DEMO_USER.id, phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: DEMO_USER });
});

router.get('/me', (req, res) => {
  res.json(DEMO_USER);
});

module.exports = router;
