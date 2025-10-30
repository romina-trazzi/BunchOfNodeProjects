// App Express snella: middleware base + registrazione rotte + errori comuni.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { mountSwagger } from './docs/swagger.js'; 

import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { jsonErrorGuard } from './middleware/bodyErrorHandler.js';
import { notFound } from './middleware/endpointNotFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { registerRoutes } from './routes/index.js';

const app = express();

// ====== CORS ======
const allowedOrigins =
  (process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean)) ||
  ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ====== Parser & cookie ======
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ====== Sicurezza ======
app.use(helmet());

// ====== Logging ======
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ====== Rate limit ======
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// ====== Guard per errori del body parser ======
app.use(jsonErrorGuard);

// ====== Health check ======
app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// ====== Rotte applicative ======
registerRoutes(app);
mountSwagger(app); // UI su http://localhost:3000/docs

// ====== 404 & Error handler ======
app.use(notFound);
app.use(errorHandler);

export default app;