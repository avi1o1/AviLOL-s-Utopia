const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Log more detailed error information
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.name === 'MongoNetworkError') {
      console.error('Network issue - check your internet connection or MongoDB Atlas network settings');
    }
    process.exit(1);
  }
};

module.exports = connectDB;