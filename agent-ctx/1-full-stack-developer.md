# Task 1 — Turso Cloud Database Setup

## Agent: full-stack-developer

## Summary
Set up dual-database support (Turso cloud + local SQLite fallback) for the AB Kreative lead platform.

## Files Changed
1. **`src/lib/db.ts`** — Complete rewrite:
   - Async initialization with `Proxy`-based lazy client
   - Dynamic imports for `@libsql/client` + `@prisma/adapter-libsql` when `TURSO_DATABASE_URL` is set
   - Automatic fallback to local SQLite on missing env vars or connection errors
   - Global singleton preserved for dev HMR
   - New exports: `getDbReady()`, `getDbMode()`

2. **`.env.example`** — Added Turso env vars with documentation

3. **`src/app/api/db-health/route.ts`** — New health check endpoint (GET)
   - Returns `{ turso, local, connected, database }`
   - 200 on success, 503 on failure
   - Uses `SELECT 1` for live connection test

4. **`prisma/schema.prisma`** — Unchanged (stays `provider = "sqlite"`)

## Verification
- `bun run lint` passes with zero errors/warnings