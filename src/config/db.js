const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connectMasterDB = async () => {
  try {

    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI length:', MONGO_URI ? MONGO_URI.length : 0);
    
    if (!MONGO_URI) {
      throw new Error("MongoDB connection string is not defined. Please set MONGO_URI environment variable.");
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("MongoDB Connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });


  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    // Don't exit in production, let the app try to reconnect
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectMasterDB;
