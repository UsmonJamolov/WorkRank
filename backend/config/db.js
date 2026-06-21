const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workrank';
  await mongoose.connect(uri);
  console.log(`MongoDB ulandi: ${uri}`);
};

module.exports = connectDB;
