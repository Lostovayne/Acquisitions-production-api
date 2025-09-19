import logger from '#config/logger';
import { errorHandler, notFoundHandler } from '#middlewares/error.middleware';
import { securityMiddleware } from '#middlewares/security.middleware';
import authRoutes from '#routes/auth.routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(securityMiddleware);

// Routes
app.get('/', (req, res) => res.send('Welcome to the API'));

app.get('/health', (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    arcjet: {
      mode: isDevelopment ? 'DRY_RUN' : 'LIVE',
      key_status: process.env.ARCJET_KEY ? 'CONFIGURED' : 'MISSING',
    },
    request_info: {
      ip: req.ip,
      user_agent: req.get('User-Agent') || 'None',
    },
  });
});

app.get('/api', (req, res) =>
  res.status(200).json({ message: 'API is running' })
);

app.use('/api/auth', authRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
