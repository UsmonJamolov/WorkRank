const express = require('express');
const Attendance = require('../models/Attendance');

const router = express.Router();
const WORKPLACE_QR = process.env.WORKPLACE_QR_CODE || 'WRK-SMART-2026-001';

router.get('/workplace-qr.png', async (_req, res) => {
  try {
    const QRCode = require('qrcode');
    const png = await QRCode.toBuffer(WORKPLACE_QR, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="workrank-ishxona-qr.png"');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-today', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    await Attendance.deleteOne({ employeeId, date: today });
    res.json({ message: 'Bugungi davomat tozalandi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkin', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      const checkInTime = `${String(new Date(existing.checkIn).getHours()).padStart(2, '0')}:${String(new Date(existing.checkIn).getMinutes()).padStart(2, '0')}`;
      return res.json({
        message: 'Bugungi davomat allaqachon qayd etilgan',
        record: existing,
        checkInTime,
      });
    }

    const record = await Attendance.create({
      employeeId,
      checkIn: now,
      date,
    });

    res.status(201).json({
      message: 'Davomat muvaffaqiyatli qayd etildi',
      record,
      checkInTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ employeeId, date: today });
    if (!record) return res.status(404).json({ error: 'Bugungi kirish topilmadi' });

    if (record.checkOut) {
      const checkOutTime = `${String(new Date(record.checkOut).getHours()).padStart(2, '0')}:${String(new Date(record.checkOut).getMinutes()).padStart(2, '0')}`;
      return res.json({
        message: 'Bugungi ketish allaqachon qayd etilgan',
        checkOutTime,
        record,
      });
    }

    record.checkOut = new Date();
    await record.save();
    const checkOutTime = `${String(record.checkOut.getHours()).padStart(2, '0')}:${String(record.checkOut.getMinutes()).padStart(2, '0')}`;
    res.json({
      message: 'Ketish vaqti qayd etildi. Ish kuni yakunlandi!',
      checkOutTime,
      record,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today/:employeeId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ employeeId: req.params.employeeId, date: today });
    if (!record) return res.json({ status: 'none' });

    const checkInTime = `${String(new Date(record.checkIn).getHours()).padStart(2, '0')}:${String(new Date(record.checkIn).getMinutes()).padStart(2, '0')}`;
    const checkOutTime = record.checkOut
      ? `${String(new Date(record.checkOut).getHours()).padStart(2, '0')}:${String(new Date(record.checkOut).getMinutes()).padStart(2, '0')}`
      : null;

    res.json({
      status: checkOutTime ? 'finished' : 'working',
      checkInTime,
      checkOutTime,
      record,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:employeeId', async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
