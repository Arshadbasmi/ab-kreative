import { NextRequest, NextResponse } from 'next/server'
import { initTursoClient, tursoCreateLead } from '@/lib/turso-client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate required fields
  if (!body.title || !body.category) {
    return NextResponse.json(
      { error: 'title and category are required' },
      { status: 400 },
    )
  }

  // If Turso is configured, save there; otherwise return the lead as-is
  // (the caller can decide what to do with it)
  if (!process.env.TURSO_DATABASE_URL) {
    // Turso not configured — return the lead with a notice
    return NextResponse.json({
      lead: {
        ...body,
        id: body.id || `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      notice: 'Turso not configured — lead returned but not persisted. Set TURSO_DATABASE_URL to persist.',
    })
  }

  const ready = await initTursoClient()
  if (!ready) {
    return NextResponse.json(
      { error: 'Turso connection failed' },
      { status: 503 },
    )
  }

  try {
    const lead = await tursoCreateLead(body)
    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Save lead error:', error)
    return NextResponse.json(
      { error: 'Failed to save lead', details: String(error) },
      { status: 500 },
    )
  }
}