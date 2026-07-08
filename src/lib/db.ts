import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

let dbMode = 'local';
let isReady = false;

const prismaClientSingleton = () => {
  const databaseUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;

  // Prefer Turso when cloud credentials are present, then fall back to local SQLite.
  if (databaseUrl && databaseUrl.startsWith('libsql:') && process.env.TURSO_AUTH_TOKEN) {
    dbMode = 'turso';

    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    isReady = true;
    return new PrismaClient({ adapter });
  }
  
  // Local SQLite fallback
  isReady = true;
  return new PrismaClient();
};

// Preserve singleton in dev for HMR
const globalForPrisma = globalThis as unknown as { prismaGlobal: 
PrismaClient };
export const db = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

export const getDbMode = () => dbMode;
export const getDbReady = () => isReady;
export const isDbAvailable = () => isReady;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = 
db;
