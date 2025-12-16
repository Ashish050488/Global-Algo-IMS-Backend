const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace 'your_mongo_uri' with your actual local or Atlas URI
    // Example Local: 'mongodb://127.0.0.1:27017/callcenter'
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/callcenter');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;