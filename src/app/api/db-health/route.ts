import { NextResponse } from 'next/server';
import { db, getDbMode } from '@/lib/db';

export async function GET() {
  try {
    // Live connection test
    await db.$queryRaw`SELECT 1`;
    const mode = getDbMode();

    return NextResponse.json(
      { 
        turso: mode === 'turso', 
        local: mode === 'local', 
        connected: true, 
        database: mode 
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        connected: false, 
        error: error?.message || 'Database connection failed' 
      },
      { status: 503 }
    );
  }
}
