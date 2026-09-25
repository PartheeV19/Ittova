import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getPool } from './db/pool.js';
import { attachUser } from './middleware/auth.js';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customers.routes.js';
import vendorRoutes from './routes/vendors.routes.js';
import staffRoutes from './routes/staff.routes.js';
import projectRoutes from './routes/projects.routes.js';

const app = express();
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser);

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/customers`, customerRoutes);
app.use(`${apiPrefix}/vendors`, vendorRoutes);
app.use(`${apiPrefix}/staff`, staffRoutes);
app.use(`${apiPrefix}/projects`, projectRoutes);

app.get(`${apiPrefix}/health/live`, (_request, response) => {
  response.json({ status: 'ok' });
});

app.get(`${apiPrefix}/health/ready`, async (_request, response) => {
  try {
    await getPool().query('SELECT 1');
    response.json({ status: 'ready', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
});

app.use(apiPrefix, (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' });
});

app.use((error, _request, response, _next) => {
  const status = error.statusCode || (error.message === 'Origin is not allowed by CORS.' ? 403 : 500);
  if (status >= 500) console.error('API request failed:', error.message);
  response.status(status).json({
    error: status >= 500 ? 'Internal server error.' : error.message
  });
});

export default app;
