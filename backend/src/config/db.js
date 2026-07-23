import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('Skipping MongoDB connection in test environment');
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('\n❌ CRITICAL DATABASE CONFIG ERROR: MONGO_URI is missing!');
    console.error('👉 Please set MONGO_URI in your .env or Render Dashboard Environment Variables with your MongoDB Atlas cloud URI:');
    console.error('   e.g. MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/school_mgmt?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
