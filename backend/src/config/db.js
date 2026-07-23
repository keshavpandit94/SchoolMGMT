import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('Skipping MongoDB connection in test environment');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_mgmt');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
