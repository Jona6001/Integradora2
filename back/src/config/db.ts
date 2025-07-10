import mongoose from 'mongoose';

const connection = async (): Promise<void> => {
    const mongoUrl = 'mongodb://localhost:27017/Segunda_Integradora'; 
    try {
        await mongoose.connect(mongoUrl);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
};

export default connection;