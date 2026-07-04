import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

import { ENV } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { sanitizeInput, sanitizeStrings } from './middlewares/sanitize';
import { apiLimiter } from './middlewares/rateLimiter';
import logger from './utils/logger';

const app: Application = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Vercel, etc.)
app.set('trust proxy', 1);

// Security Middlewares
// Helmet - sets various HTTP headers for security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:', 'blob:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3000/',
      'http://localhost:3001/',
      'http://localhost:3002/',
      'https://genesisboutique-frontend.vercel.app',
      'https://genesisboutique-admin.vercel.app',
      'https://*.vercel.app', // Allow all Vercel preview deployments
    ];

const corsConfig = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Check wildcard match for Vercel preview deployments
    const isVercelPreview = origin.includes('.vercel.app');
    if (isVercelPreview) {
      callback(null, true);
      return;
    }

    logger.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Health Check Route (for monitoring and Render wake-up)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Genesis Boutique Backend is running ✅',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Body parsers with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Sanitization middleware - prevent NoSQL injection and XSS
app.use(sanitizeInput);
app.use(sanitizeStrings);

// Rate limiting - apply to all API routes
app.use('/api/', apiLimiter);

// Log bad requests to api_error_logs.txt
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      try {
        const logFilePath = path.join(__dirname, '../api_error_logs.txt');
        const logMessage = `
[${new Date().toISOString()}] RESPONDED: ${req.method} ${req.originalUrl} -> Status ${res.statusCode}
Headers: ${JSON.stringify(req.headers, null, 2)}
Query: ${JSON.stringify(req.query, null, 2)}
Body: ${JSON.stringify(req.body, null, 2)}
--------------------------------------------------------------------------------
`;
        fs.appendFileSync(logFilePath, logMessage);
      } catch (logErr) {
        // ignore
      }
    }
  });
  next();
});

// Logger
if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// API Routes
app.use('/api/v1', apiRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
