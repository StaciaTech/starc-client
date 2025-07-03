import mongoose from 'mongoose';
import config from '../config/index.js';

// MongoDB connection options
const options = {
  autoIndex: true
};

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 