
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const connectDB = require("./src/config/db");
const { getPort, config } = require("./src/config/environment");


const app = require("./src/app");

// Get port from environment variable
const PORT = getPort();

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit in production, let the app try to recover
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit in production, let the app try to recover
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    Ideation management microservice is running:
    - Port: ${PORT}
    - Environment: ${config.environment}
    - App Environment: ${config.appEnvironment}
    - Log Level: ${config.logging.level}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
