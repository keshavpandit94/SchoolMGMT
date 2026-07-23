import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('Skipping MongoDB connection in test environment');
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri && process.env.NODE_ENV === 'production') {
    console.error('\n❌ CRITICAL PRODUCTION ERROR: MONGO_URI is missing!');
    console.error('Render cannot connect to 127.0.0.1 in production mode.');
    console.error('👉 Please set MONGO_URI in your Render Dashboard Environment Variables with a MongoDB Atlas cloud URI.\n');
    process.exit(1);
  }

  const connString = mongoUri || 'mongodb://127.0.0.1:27017/school_mgmt';

  try {
    const conn = await mongoose.connect(connString);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
