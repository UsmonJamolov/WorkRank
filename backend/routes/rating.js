const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Noto\'g\'ri davr' });
    }

    const limit = period === 'daily' ? 10 : period === 'weekly' ? 10 : 10;
    const users = await User.find({ role: 'employee' })
      .sort({ points: -1 })
      .limit(limit);

    const divisor = period === 'daily' ? 5 : period === 'weekly' ? 1.2 : 1;

    res.json(
      users.map((u, i) => ({
        rank: i + 1,
        fullName: u.fullName,
        avatar: u.avatar,
        points: Math.round(u.points / divisor),
        position: u.position,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
