import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable, getDbReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/leads/[id] - Get single lead + increment views
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { id } = await params

    const lead = await db.lead.findUnique({ where: { id } })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Increment views (fire-and-forget)
    await db.lead.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

// DELETE /api/leads/[id] - Close/cancel a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { id } = await params
    await db.lead.update({
      where: { id },
      data: { status: 'CLOSED' },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error)
    return NextResponse.json({ error: 'Failed to close lead' }, { status: 500 })
  }
}