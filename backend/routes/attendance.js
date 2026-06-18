const express = require('express');
const router = express.Router();

const records = [];

router.post('/checkin', (req, res) => {
  const { employeeId } = req.body;
  const now = new Date();
  const record = {
    id: Date.now().toString(),
    employeeId: employeeId || '1',
    checkIn: now.toISOString(),
    date: now.toISOString().split('T')[0],
  };
  records.push(record);
  res.status(201).json({
    message: 'Davomat muvaffaqiyatli qayd etildi',
    record,
    checkInTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  });
});

router.post('/checkout', (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const record = records.find((r) => r.employeeId === (employeeId || '1') && r.date === today);
  if (!record) return res.status(404).json({ error: 'Bugungi kirish topilmadi' });
  record.checkOut = new Date().toISOString();
  res.json(record);
});

router.get('/:employeeId', (req, res) => {
  const userRecords = records.filter((r) => r.employeeId === req.params.employeeId);
  res.json(userRecords);
});

module.exports = router;
