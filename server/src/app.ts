import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { config } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  const configuredClients = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const allowedOrigins = Array.from(
    new Set(
      [
        'http://localhost:5173',
        'http://localhost:5000',
        'https://pfis-patient-friction-intelligence.onrender.com',
        'https://pfis-patient-friction-intelligence-system.onrender.com',
        config.clientUrl,
        ...configuredClients,
      ].filter(Boolean)
    )
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server, curl)
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/+$/, '');
        if (
          allowedOrigins.includes(normalizedOrigin) ||
          (config.nodeEnv === 'development' && /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) ||
          /\.onrender\.com$/.test(normalizedOrigin)
        ) {
          callback(null, true);
        } else {
          console.warn(`[CORS Blocked] Origin: ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests created from this IP, please try again after 15 minutes.',
    },
  });
  app.use('/api', limiter);

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Body Parsing
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory for document previews
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    try {
      fs.mkdirSync(uploadsPath, { recursive: true });
    } catch {
      // Directory creation fallback
    }
  }
  app.use('/uploads', express.static(uploadsPath));

  // Production Health Check for Cloud Platforms (Render, AWS, GCP)
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'PFIS - Patient Friction Intelligence System',
      message: 'PFIS API is healthy and operational',
    });
  });

  // System Health Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      system: 'Patient Friction Intelligence System (PFIS)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      mapMode: config.googleMapsApiKey ? 'Google Maps API Active' : 'Demo Map Engine Active',
    });
  });

  // Mount Application Routes
  app.use('/api', routes);

  // Client static build directory detection (for full-stack deployment or local preview)
  const candidateClientDirs = [
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(process.cwd(), 'client/dist'),
  ];
  const clientDistDir = candidateClientDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

  if (clientDistDir) {
    console.log(`[PFIS Server] Serving React static frontend from: ${clientDistDir}`);
    app.use(express.static(clientDistDir));

    // 404 Route Handler specifically for API requests
    app.use('/api', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: `API endpoint [${req.method}] ${req.originalUrl} does not exist on PFIS server.`,
      });
    });

    // SPA Fallback: Any non-API, non-health GET route serves index.html
    app.get('*', (req: Request, res: Response, next: any) => {
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/health') ||
        req.path.startsWith('/uploads')
      ) {
        return next();
      }
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  } else {
    // Production Root Endpoint when frontend is served separately (e.g. Render Static Site)
    app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'PFIS API is running',
        service: 'PFIS - Patient Friction Intelligence System',
      });
    });

    // 404 Route Handler when frontend build is not present
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: `API endpoint [${req.method}] ${req.originalUrl} does not exist on PFIS server.`,
      });
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

