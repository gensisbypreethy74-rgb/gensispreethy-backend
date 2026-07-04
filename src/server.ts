import app from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import { seedAdmin } from './utils/seedAdmin';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Ensure a default admin is available in development
// Reload trigger comment
    await seedAdmin();

    // Start Express Server
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
