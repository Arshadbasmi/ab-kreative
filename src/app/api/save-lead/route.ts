import { NextRequest, NextResponse } from 'next/server'
import { initTursoClient, tursoCreateLead } from '@/lib/turso-client'
import { db, isDbAvailable } from '@/lib/db'
import {
  getLeadValidationIssues,
  normalizeEmail,
  normalizePublicUrl,
} from '@/lib/lead-quality'

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

  const validationIssues = getLeadValidationIssues(body)
  if (validationIssues.length > 0) {
    return NextResponse.json(
      { error: 'Lead failed contact verification', issues: validationIssues },
      { status: 422 },
    )
  }

  const normalizedSourceUrl = normalizePublicUrl(body.sourceUrl)!
  const normalizedEmail = normalizeEmail(body.clientEmail)!
  const normalizedBody = {
    ...body,
    sourceUrl: normalizedSourceUrl,
    clientEmail: normalizedEmail,
  }

  try {
    if (process.env.TURSO_DATABASE_URL) {
      const ready = await initTursoClient()
      if (!ready) {
        return NextResponse.json(
          { error: 'Turso connection failed' },
          { status: 503 },
        )
      }

      const lead = await tursoCreateLead(normalizedBody)
      return NextResponse.json({ lead }, { status: 201 })
    }

    if (!isDbAvailable()) {
      return NextResponse.json(
        {
          error:
            'Database not configured. Set TURSO_DATABASE_URL/TURSO_AUTH_TOKEN or DATABASE_URL before saving leads.',
        },
        { status: 503 },
      )
    }

    const lead = await db.lead.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory || null,
        country: body.country,
        city: body.city || null,
        region: body.region || null,
        budgetMin: Number(body.budgetMin),
        budgetMax: Number(body.budgetMax),
        currency: body.currency || 'USD',
        timeline: body.timeline,
        skills: body.skills,
        source: body.source || 'website_scraped',
        sourceUrl: normalizedSourceUrl,
        clientName: body.clientName,
        clientCompany: body.clientCompany || null,
        clientEmail: normalizedEmail,
        clientPhone: body.clientPhone || null,
        clientAddress: body.clientAddress || null,
        clientLinkedin: body.clientLinkedin || null,
        clientWebsite: body.clientWebsite || null,
        experienceReq: body.experienceReq || null,
        projectType: body.projectType || null,
        urgent: Boolean(body.urgent),
        featured: false,
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Save lead error:', error)
    return NextResponse.json(
      { error: 'Failed to save lead', details: String(error) },
      { status: 500 },
    )
  }
}
