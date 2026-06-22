import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware } from '@clerk/express';

import { authOptional } from './middleware/auth.js';
import { pageView } from './middleware/pageView.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.endsWith('.vercel.app')) return cb(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o))) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(authOptional);
app.use(pageView);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
