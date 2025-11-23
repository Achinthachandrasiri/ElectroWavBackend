// config/database.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://achinthahost3000:xyx500@host3000.7qkcxhk.mongodb.net/electro_wav?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected to Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit process if DB fails
  }
};

module.exports = connectDB;
