# ITOVA API

This is the Node.js API and PostgreSQL foundation for replacing the browser-only application store. The current UI still reads and writes its demo data through `localStorage`; API-backed workflows will be connected in follow-up slices.

## Local setup

1. Copy `.env.example` to `.env` and replace the local database password in both `POSTGRES_PASSWORD` and `DATABASE_URL`.
2. Start PostgreSQL with `npm run db:up` (Docker Compose required).
3. Apply pending SQL migrations with `npm run db:migrate`.
4. Start the API with `npm run server:dev`.
5. Start the Vite app separately with `npm run dev`.

The Vite development server proxies `/api/*` requests to the API at `http://localhost:3001`.

## Initial routes

- `GET /api/v1/health/live` reports that the API process is running.
- `GET /api/v1/health/ready` checks the PostgreSQL connection and returns `503` until the database is reachable.

The first migration establishes account, customer, vendor, staff, project, machine, quote, document-metadata, and project-event tables. Document files themselves will live in object storage; PostgreSQL stores their metadata and storage keys.
