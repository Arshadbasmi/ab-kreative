import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Global singleton – prevents multiple PrismaClient instances in dev (HMR)
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbAvailable: boolean | undefined
  dbMode: 'turso' | 'local' | undefined
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let prismaInstance: PrismaClient | undefined
let _isAvailable = true
let _dbMode: 'turso' | 'local' = 'local'
let _initPromise: Promise<void> | null = null

// ---------------------------------------------------------------------------
// Initialisation – async because Turso adapter uses dynamic imports
// ---------------------------------------------------------------------------
async function initializeDatabase() {
  // Reuse global singleton in dev
  if (
    process.env.NODE_ENV !== 'production' &&
    globalForPrisma.prisma
  ) {
    prismaInstance = globalForPrisma.prisma
    _isAvailable = globalForPrisma.dbAvailable ?? true
    _dbMode = globalForPrisma.dbMode ?? 'local'
    return
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL

  // ---- Try Turso ----------------------------------------------------------
  if (tursoUrl) {
    try {
      const { createClient } = await import('@libsql/client')
      const { PrismaLibSql } = await import('@prisma/adapter-libsql')

      const libsql = createClient({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })

      const adapter = new PrismaLibSql(libsql)

      prismaInstance = new PrismaClient({
        adapter,
        datasources: { db: { url: 'file:./dummy.db' } },
        log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
      })

      _dbMode = 'turso'
    } catch (err) {
      console.error(
        '[db] Turso connection failed – falling back to local SQLite.',
        err,
      )
    }
  }

  // ---- Fall back to local SQLite ------------------------------------------
  if (!prismaInstance) {
    try {
      const databaseUrl =
        process.env.DATABASE_URL || 'file:./db/custom.db'

      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
        datasources: {
          db: { url: databaseUrl },
        },
      })

      _dbMode = 'local'
    } catch (err) {
      console.error('[db] Local SQLite initialisation failed:', err)
      _isAvailable = false
      prismaInstance = undefined
    }
  }

  // Persist to global in dev
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
    globalForPrisma.dbAvailable = _isAvailable
    globalForPrisma.dbMode = _dbMode
  }
}

// Kick off initialisation immediately at module-load time.
// The dynamic imports resolve very quickly (packages are already installed),
// so by the time any API route handles its first request the client is ready.
if (!_initPromise) {
  _initPromise = initializeDatabase()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Await this before using `db` if you need a guaranteed-ready client. */
export async function getDbReady(): Promise<void> {
  if (_initPromise) await _initPromise
}

/**
 * Prisma client proxy.
 *
 * All property accesses are forwarded to the real PrismaClient once it has
 * been initialised.  In the unlikely event the client is accessed before
 * initialisation completes, a descriptive error is thrown.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    if (!prismaInstance) {
      throw new Error(
        '[db] Database client not initialised yet. ' +
          'Call `await getDbReady()` before accessing the database.',
      )
    }
    const value = Reflect.get(prismaInstance, prop, prismaInstance)
    if (typeof value === 'function') {
      return value.bind(prismaInstance)
    }
    return value
  },
})

/** Whether the database connection was successfully established. */
export const isDbAvailable = () => _isAvailable

/** Current connection mode: `'turso'` or `'local'`. */
export const getDbMode = () => _dbMode