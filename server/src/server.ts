import { createApp } from './app.js';
import { connectDB } from './config/database.js';
import { config, validateGoogleOAuthEnv } from './config/env.js';

const startServer = async () => {
  console.log('---------------------------------------------------------');
  console.log('  PATIENT FRICTION INTELLIGENCE SYSTEM (PFIS)');
  console.log('  Non-Clinical Healthcare Accessibility Platform');
  console.log('---------------------------------------------------------');

  await connectDB();

  validateGoogleOAuthEnv();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`[PFIS Server] Running on port http://localhost:${config.port}`);
    console.log(`[PFIS Server] Client URL: ${config.clientUrl}`);
    console.log(`[PFIS Server] Map Status: ${config.googleMapsApiKey ? 'Google Maps API' : 'Demo Map Engine (Haversine & GeoJSON)'}`);
    console.log(`[PFIS Server] Environment: ${config.nodeEnv}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`[PFIS Server] ${signal} signal received. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[PFIS Server] HTTP server closed gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[PFIS Server Fatal Error]', err);
  process.exit(1);
});
