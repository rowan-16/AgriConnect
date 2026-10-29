import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Enable command buffering so queries cleanly wait for connection on serverless cold starts
mongoose.set('bufferCommands', true);

const ATLAS_URI = 'mongodb+srv://jowanm1234_db_user:eHatIAxq1TnHziZj@cluster0.p3m41it.mongodb.net/agriconnect?retryWrites=true&w=majority&appName=Cluster0';

let isConnecting = false;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) {
    let waited = 0;
    while (mongoose.connection.readyState !== 1 && waited < 5000) {
      await new Promise(r => setTimeout(r, 100));
      waited += 100;
    }
    return;
  }

  isConnecting = true;
  const mongoURI = process.env.MONGODB_URI || ATLAS_URI;
  try {
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (err) {
    console.warn(`⚠️ MongoDB Atlas Connection Note: ${err.message}`);
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/agriconnect', { serverSelectionTimeoutMS: 2000 });
      console.log(`🍃 Local MongoDB Connected: ${localConn.connection.host} (DB: ${localConn.connection.name})`);
    } catch (localErr) {
      console.log('💡 Express REST API is running in mock/demo fallback mode.');
    }
  } finally {
    isConnecting = false;
  }
};
