import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable, getDbReady } from '@/lib/db'
import { initTursoClient, tursoGetAnalytics } from '@/lib/turso-client'
import { proxyToLiveApi, shouldProxyToLiveApi } from '@/lib/live-api-proxy'

export const dynamic = 'force-dynamic'

const emptyResponse = {
  totals: { totalLeads: 0, urgentLeads: 0, featuredLeads: 0, totalPipelineValue: 0, avgBudget: 0, maxBudget: 0, minBudget: 0 },
  leadsByCategory: [],
  leadsByCountry: [],
  leadsByRegion: [],
  leadsBySubcategory: [],
  trendingLeads: [],
}

// GET /api/analytics - Aggregate stats for the dashboard
export async function GET(request: NextRequest) {
  if (shouldProxyToLiveApi()) {
    return proxyToLiveApi(request, '/api/analytics')
  }

  try {
    // Try Turso first (direct libsql)
    if (process.env.TURSO_DATABASE_URL) {
      const ready = await initTursoClient()
      if (ready) {
        const { createClient } = await import('@libsql/client')
        const turso = createClient({
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        })

        const [total, urgent, featured, budgetAgg, trending] = await Promise.all([
          turso.execute({ sql: 'SELECT COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\'', args: {} }),
          turso.execute({ sql: 'SELECT COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\' AND "urgent" = 1', args: {} }),
          turso.execute({ sql: 'SELECT COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\' AND "featured" = 1', args: {} }),
          turso.execute({ sql: 'SELECT AVG("budgetMax") as avg, SUM("budgetMax") as sum, MAX("budgetMax") as max, MIN("budgetMin") as min FROM "Lead" WHERE "status" = \'OPEN\'', args: {} }),
          turso.execute({ sql: 'SELECT "id","title","country","category","budgetMax","views" FROM "Lead" WHERE "status" = \'OPEN\' ORDER BY "views" DESC LIMIT 5', args: {} }),
        ])

        const { categories, regions } = await tursoGetAnalytics()

        return NextResponse.json({
          totals: {
            totalLeads: Number(total.rows[0]?.c || 0),
            urgentLeads: Number(urgent.rows[0]?.c || 0),
            featuredLeads: Number(featured.rows[0]?.c || 0),
            totalPipelineValue: Math.round(Number(budgetAgg.rows[0]?.sum || 0)),
            avgBudget: Math.round(Number(budgetAgg.rows[0]?.avg || 0)),
            maxBudget: Math.round(Number(budgetAgg.rows[0]?.max || 0)),
            minBudget: Math.round(Number(budgetAgg.rows[0]?.min || 0)),
          },
          leadsByCategory: Object.entries(categories).map(([category, count]) => ({
            category,
            name: category,
            count,
            avgBudget: 0,
          })),
          leadsByRegion: Object.entries(regions).map(([region, count]) => ({
            region,
            name: region,
            count,
          })),
          leadsByCountry: [],
          leadsBySubcategory: [],
          trendingLeads: trending.rows.map((r: Record<string, unknown>) => ({
            id: r.id,
            title: r.title,
            country: r.country,
            category: r.category,
            budgetMax: Number(r.budgetMax),
            views: Number(r.views),
          })),
        })
      }
    }

    // Fall back to Prisma (local SQLite)
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json(emptyResponse)
    }

    const [totalLeads, urgentLeads, featuredLeads] = await Promise.all([
      db.lead.count({ where: { status: 'OPEN' } }),
      db.lead.count({ where: { status: 'OPEN', urgent: true } }),
      db.lead.count({ where: { status: 'OPEN', featured: true } }),
    ])

    const leadsByCategoryRaw = await db.lead.groupBy({
      by: ['category'],
      where: { status: 'OPEN' },
      _count: { _all: true },
      _avg: { budgetMax: true },
    })
    const leadsByCategory = leadsByCategoryRaw.map((c) => ({
      category: c.category,
      name: c.category,
      count: c._count._all,
      avgBudget: Math.round(c._avg.budgetMax || 0),
    }))

    const leadsByCountryRaw = await db.lead.groupBy({
      by: ['country'],
      where: { status: 'OPEN' },
      _count: { _all: true },
    })
    const leadsByCountry = leadsByCountryRaw.map((c) => ({
      country: c.country,
      name: c.country,
      count: c._count._all,
    }))

    const leadsByRegionRaw = await db.lead.groupBy({
      by: ['region'],
      where: { status: 'OPEN', region: { not: null } },
      _count: { _all: true },
    })
    const leadsByRegion = leadsByRegionRaw.map((r) => ({
      region: r.region!,
      name: r.region!,
      count: r._count._all,
    }))

    const leadsBySubcategoryRaw = await db.lead.groupBy({
      by: ['subcategory', 'category'],
      where: { status: 'OPEN', subcategory: { not: null } },
      _count: { _all: true },
    })
    const leadsBySubcategory = leadsBySubcategoryRaw.map((s) => ({
      subcategory: s.subcategory!,
      category: s.category,
      count: s._count._all,
    }))

    const budgetAgg = await db.lead.aggregate({
      where: { status: 'OPEN' },
      _avg: { budgetMin: true, budgetMax: true },
      _sum: { budgetMax: true },
      _max: { budgetMax: true },
      _min: { budgetMin: true },
    })

    const trendingLeads = await db.lead.findMany({
      where: { status: 'OPEN' },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        country: true,
        category: true,
        budgetMax: true,
        views: true,
      },
    })

    return NextResponse.json({
      totals: {
        totalLeads,
        urgentLeads,
        featuredLeads,
        totalPipelineValue: Math.round(budgetAgg._sum.budgetMax || 0),
        avgBudget: Math.round(budgetAgg._avg.budgetMax || 0),
        maxBudget: Math.round(budgetAgg._max.budgetMax || 0),
        minBudget: Math.round(budgetAgg._min.budgetMin || 0),
      },
      leadsByCategory,
      leadsByCountry,
      leadsByRegion,
      leadsBySubcategory,
      trendingLeads,
    })
  } catch (error) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json(emptyResponse)
  }
}
