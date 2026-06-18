require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const attendanceRoutes = require('./routes/attendance');
const ratingRoutes = require('./routes/rating');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'WorkRank API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/rating', ratingRoutes);

app.listen(PORT, () => {
  console.log(`WorkRank API ishga tushdi: http://localhost:${PORT}`);
});
