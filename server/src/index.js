import 'dotenv/config';
import app from './app.js';
import { closePool } from './db/pool.js';

// Railway/Render/etc. assign PORT dynamically and route traffic to it --
// API_PORT stays as the local-dev override (compose.yaml, .env).
const port = Number.parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);
const server = app.listen(port, () => {
  console.log(`ITOVA API listening on http://localhost:${port}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down ITOVA API.`);

  server.close(async (error) => {
    if (error) console.error('Error closing HTTP server:', error.message);
    try {
      await closePool();
      process.exit(error ? 1 : 0);
    } catch (closeError) {
      console.error('Error closing PostgreSQL pool:', closeError.message);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
