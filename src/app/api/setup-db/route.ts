import { NextRequest, NextResponse } from 'next/server'
import seedLeads from '@/lib/seed-data.json'

export const dynamic = 'force-dynamic'

// Creates the Lead table on Turso. Sample leads are inserted only with ?seed=true.
// Each SQL statement is sent individually — Turso/libsql requires this.

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "country" TEXT NOT NULL,
  "city" TEXT,
  "region" TEXT,
  "budgetMin" INTEGER NOT NULL DEFAULT 0,
  "budgetMax" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "timeline" TEXT NOT NULL,
  "skills" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'direct',
  "sourceUrl" TEXT,
  "clientName" TEXT NOT NULL,
  "clientCompany" TEXT,
  "clientEmail" TEXT NOT NULL,
  "clientPhone" TEXT,
  "clientAddress" TEXT,
  "clientLinkedin" TEXT,
  "clientWebsite" TEXT,
  "experienceReq" TEXT,
  "projectType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "urgent" BOOLEAN NOT NULL DEFAULT 0,
  "featured" BOOLEAN NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS "Lead_category_idx" ON "Lead"("category")',
  'CREATE INDEX IF NOT EXISTS "Lead_country_idx"  ON "Lead"("country")',
  'CREATE INDEX IF NOT EXISTS "Lead_region_idx"   ON "Lead"("region")',
  'CREATE INDEX IF NOT EXISTS "Lead_status_idx"   ON "Lead"("status")',
  'CREATE INDEX IF NOT EXISTS "Lead_source_idx"   ON "Lead"("source")',
]

function esc(s: string | null | undefined): string {
  if (s == null) return 'NULL'
  return "'" + String(s).replace(/'/g, "''") + "'"
}

function leadToInsert(l: (typeof seedLeads)[number]): string {
  return `INSERT OR IGNORE INTO "Lead" ("id","title","description","category","subcategory","country","city","region","budgetMin","budgetMax","currency","timeline","skills","source","sourceUrl","clientName","clientCompany","clientEmail","clientPhone","clientAddress","clientLinkedin","clientWebsite","experienceReq","projectType","status","urgent","featured","views","createdAt","updatedAt") VALUES (${esc(l.id)},${esc(l.title)},${esc(l.description)},${esc(l.category)},${esc(l.subcategory)},${esc(l.country)},${esc(l.city)},${esc(l.region)},${l.budgetMin},${l.budgetMax},${esc(l.currency)},${esc(l.timeline)},${esc(l.skills)},${esc(l.source)},${esc(l.sourceUrl)},${esc(l.clientName)},${esc(l.clientCompany)},${esc(l.clientEmail)},${esc(l.clientPhone)},${esc(l.clientAddress)},${esc(l.clientLinkedin)},${esc(l.clientWebsite)},${esc(l.experienceReq)},${esc(l.projectType)},${esc(l.status)},${l.urgent ? 1 : 0},${l.featured ? 1 : 0},${l.views || 0},${esc(l.createdAt)},${esc(l.updatedAt)})`
}

export async function POST(request: NextRequest) {
  const shouldSeed = new URL(request.url).searchParams.get('seed') === 'true'
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl) {
    return NextResponse.json(
      { error: 'TURSO_DATABASE_URL not configured' },
      { status: 400 },
    )
  }

  try {
    const { createClient } = await import('@libsql/client')
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken })

    // 1. Create table without deleting existing leads.
    await libsql.execute(CREATE_TABLE_SQL)

    // 2. Create indexes one by one
    for (const sql of INDEXES) {
      await libsql.execute(sql)
    }

    // 3. Check if already seeded
    const result = await libsql.execute('SELECT COUNT(*) as c FROM "Lead"')
    const count = Number(result.rows[0]?.c)
    if (count > 0 || !shouldSeed) {
      return NextResponse.json({
        success: true,
        message:
          count > 0
            ? `Database already has ${count} leads`
            : 'Database table created. Sample leads were not inserted.',
        count,
        inserted: 0,
        seeded: false,
      })
    }

    // 4. Insert leads ONE AT A TIME
    let inserted = 0
    for (const lead of seedLeads) {
      await libsql.execute(leadToInsert(lead))
      inserted++
    }

    // 5. Verify
    const verify = await libsql.execute('SELECT COUNT(*) as c FROM "Lead"')

    return NextResponse.json({
      success: true,
      message: 'Database created and sample leads seeded successfully',
      inserted,
      count: Number(verify.rows[0]?.c),
      seeded: true,
    })
  } catch (error) {
    console.error('Setup DB error:', error)
    return NextResponse.json(
      { error: 'Database setup failed', details: String(error) },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
