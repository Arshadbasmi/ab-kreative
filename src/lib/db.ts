import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

let dbMode = 'local';
let isReady = false;

const prismaClientSingleton = () => {
  // Dynamic fallback check
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    dbMode = 'turso';
    
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    const adapter = new PrismaLibSQL(libsql);
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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = 
db;
