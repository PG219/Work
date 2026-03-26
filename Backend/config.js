import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/?retryWrites=true&w=majority&appName=Governance-AI';

const connectDB = async () => {
  try {
    // Ensure the connection string doesn't have trailing slashes
    const cleanUri = MONGODB_URI.replace(/\/$/, '');
    await mongoose.connect(cleanUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;