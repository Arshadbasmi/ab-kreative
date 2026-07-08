import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable, getDbReady } from '@/lib/db'
import {
  initTursoClient,
  tursoFindLeads,
  tursoCreateLead,
} from '@/lib/turso-client'
import {
  getLeadValidationIssues,
  normalizeEmail,
  normalizePublicUrl,
} from '@/lib/lead-quality'

export const dynamic = 'force-dynamic'

// GET /api/leads - List leads with filters
export async function GET(request: NextRequest) {
  try {
    // Try Turso first (direct libsql - more reliable than Prisma adapter)
    if (process.env.TURSO_DATABASE_URL) {
      const ready = await initTursoClient()
      if (ready) {
        const { searchParams } = new URL(request.url)
        const leads = await tursoFindLeads({
          status: 'OPEN',
          country: searchParams.get('country') || undefined,
          region: searchParams.get('region') || undefined,
          category: searchParams.get('category') || undefined,
          subcategory: searchParams.get('subcategory') || undefined,
          search: searchParams.get('search') || undefined,
          urgent: searchParams.get('urgent') === 'true' ? true : undefined,
          featured: searchParams.get('featured') === 'true' ? true : undefined,
          sort: searchParams.get('sort') || undefined,
          minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
          maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
          source: searchParams.get('source') || undefined,
          today: searchParams.get('today') === 'true' ? true : undefined,
        })
        return NextResponse.json({ leads, count: leads.length })
      }
    }

    // Fall back to Prisma (local SQLite)
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json({ leads: [], count: 0 })
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || undefined
    const region = searchParams.get('region') || undefined
    const category = searchParams.get('category') || undefined
    const subcategory = searchParams.get('subcategory') || undefined
    const search = searchParams.get('search') || undefined
    const urgent = searchParams.get('urgent')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') || 'newest'
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const source = searchParams.get('source') || undefined

    const where: Record<string, unknown> = { status: 'OPEN' }

    if (country && country !== 'ALL') {
      where.country = country
    }
    if (region && region !== 'ALL') {
      where.region = region
    }
    if (category && category !== 'ALL') {
      where.category = category
    }
    if (subcategory) {
      where.subcategory = subcategory
    }
    if (source && source !== 'ALL') {
      where.source = source
    }
    if (urgent === 'true') {
      where.urgent = true
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skills: { contains: search } },
        { city: { contains: search } },
        { subcategory: { contains: search } },
        { clientName: { contains: search } },
        { clientCompany: { contains: search } },
      ]
    }

    // Budget range filters
    if (minBudget || maxBudget) {
      const budgetConditions: Array<Record<string, unknown>> = []
      if (minBudget) {
        budgetConditions.push({ budgetMax: { gte: Number(minBudget) } })
      }
      if (maxBudget) {
        budgetConditions.push({ budgetMin: { lte: Number(maxBudget) } })
      }
      if (!where.AND) {
        where.AND = []
      }
      ;(where.AND as Array<Record<string, unknown>>).push(...budgetConditions)
    }

    const orderBy: Record<string, 'asc' | 'desc'> =
      sort === 'budget_high'
        ? { budgetMax: 'desc' }
        : sort === 'budget_low'
          ? { budgetMin: 'asc' }
          : { createdAt: 'desc' }

    const leads = await db.lead.findMany({
      where,
      orderBy,
      take: 100,
    })

    return NextResponse.json({ leads, count: leads.length })
  } catch (error) {
    console.error('GET /api/leads error:', error)
    return NextResponse.json({ leads: [], count: 0 })
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const source = String(body.source || 'direct')
    const requiresContactVerification = ['website_scraped', 'ai_generated'].includes(source)

    if (requiresContactVerification) {
      const validationIssues = getLeadValidationIssues(body)
      if (validationIssues.length > 0) {
        return NextResponse.json(
          { error: 'Lead failed contact verification', issues: validationIssues },
          { status: 422 },
        )
      }
    }

    const normalizedEmail = requiresContactVerification
      ? normalizeEmail(body.clientEmail)!
      : body.clientEmail
    const normalizedSourceUrl = requiresContactVerification
      ? normalizePublicUrl(body.sourceUrl)
      : body.sourceUrl || null

    // Try Turso first
    if (process.env.TURSO_DATABASE_URL) {
      const ready = await initTursoClient()
      if (ready) {
        const lead = await tursoCreateLead({
          ...body,
          clientEmail: normalizedEmail,
          sourceUrl: normalizedSourceUrl,
        })
        return NextResponse.json({ lead }, { status: 201 })
      }
    }

    // Fall back to Prisma
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
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
        source,
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
    console.error('POST /api/leads error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
