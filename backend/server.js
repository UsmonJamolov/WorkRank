require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seed');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const attendanceRoutes = require('./routes/attendance');
const ratingRoutes = require('./routes/rating');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    app: 'WorkRank API',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'workrank' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/rating', ratingRoutes);

async function start() {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`WorkRank API ishga tushdi: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server ishga tushmadi:', err.message);
    process.exit(1);
  }
}

start();
