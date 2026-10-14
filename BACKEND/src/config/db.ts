import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURI);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }

  console.log('Connected to MongoDB');
};

export default connectDB;
