import { NextResponse } from 'next/server'
import { initTursoClient, isTursoReady, getTursoError } from '@/lib/turso-client'

export async function GET() {
  // Check Turso direct connection
  if (process.env.TURSO_DATABASE_URL) {
    const ready = await initTursoClient()
    if (ready) {
      return NextResponse.json({
        turso: true,
        connected: true,
        database: 'turso (direct)',
        method: 'libsql-client',
      })
    }
    return NextResponse.json({
      turso: true,
      connected: false,
      database: 'turso (direct)',
      error: getTursoError(),
    }, { status: 503 })
  }

  return NextResponse.json({
    turso: false,
    connected: false,
    database: 'none',
    error: 'TURSO_DATABASE_URL not set',
  }, { status: 503 })
}