const express = require('express');
const router = express.Router();

const ratings = {
  daily: [
    { rank: 1, fullName: 'Azizbek', points: 240, position: 'Elektr montajchi' },
    { rank: 2, fullName: 'Bekzod', points: 220, position: 'Elektr montajchi' },
    { rank: 3, fullName: 'Jamshid', points: 210, position: 'Diagnost' },
  ],
  weekly: [
    { rank: 1, fullName: 'Bekzod', points: 980, position: 'Elektr montajchi' },
    { rank: 2, fullName: 'Azizbek', points: 920, position: 'Elektr montajchi' },
    { rank: 3, fullName: 'Jamshid', points: 850, position: 'Diagnost' },
  ],
  monthly: [
    { rank: 1, fullName: 'Azizbek', points: 1200, position: 'Elektr montajchi' },
    { rank: 2, fullName: 'Bekzod', points: 980, position: 'Elektr montajchi' },
    { rank: 3, fullName: 'Jamshid', points: 870, position: 'Diagnost' },
  ],
};

router.get('/:period', (req, res) => {
  const { period } = req.params;
  if (!ratings[period]) return res.status(400).json({ error: 'Noto\'g\'ri davr' });
  res.json(ratings[period]);
});

module.exports = router;
