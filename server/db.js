import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering commands so queries fail immediately to in-memory fallback if DB is offline
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agriconnect';
  try {
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (err) {
    console.warn(`⚠️ MongoDB Atlas Connection Note: ${err.message}`);
    // Fallback attempt to local MongoDB instance
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/agriconnect', { serverSelectionTimeoutMS: 2000 });
      console.log(`🍃 Local MongoDB Connected: ${localConn.connection.host} (DB: ${localConn.connection.name})`);
    } catch (localErr) {
      console.log('💡 Express REST API is running in mock/demo fallback mode. To connect MongoDB Atlas, whitelist your IP in MongoDB Atlas settings.');
    }
  }
};
