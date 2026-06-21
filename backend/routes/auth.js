const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'workrank-secret-key';

function formatUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    department: user.department,
    position: user.position,
    avatar: user.avatar,
    points: user.points,
  };
}

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Telefon va parol kerak' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' });
    }

    const token = jwt.sign({ userId: user._id.toString(), phone }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token kerak' });
    }

    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    res.json(formatUser(user));
  } catch (err) {
    res.status(401).json({ error: 'Token yaroqsiz' });
  }
});

module.exports = router;
