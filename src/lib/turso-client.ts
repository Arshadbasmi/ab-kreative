import { createClient, type Client } from '@libsql/client'

// ---------------------------------------------------------------------------
// Lightweight Turso client – bypasses Prisma adapter issues on Vercel.
// Uses raw SQL through @libsql/client directly.
// ---------------------------------------------------------------------------

let _client: Client | null = null
let _ready = false
let _initError: string | null = null

function getClient(): Client {
  if (!_client) throw new Error('Turso client not initialized. Call initTursoClient() first.')
  return _client
}

export async function initTursoClient(): Promise<boolean> {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    _initError = 'TURSO_DATABASE_URL not set'
    return false
  }

  try {
    _client = createClient({ url, authToken: token })
    // Quick connectivity check
    await _client.execute('SELECT 1')
    _ready = true
    return true
  } catch (err) {
    _initError = String(err)
    _ready = false
    return false
  }
}

export function isTursoReady() {
  return _ready
}

export function getTursoError() {
  return _initError
}

// ---------------------------------------------------------------------------
// Lead queries (raw SQL)
// ---------------------------------------------------------------------------

interface LeadRow {
  id: string
  title: string
  description: string
  category: string
  subcategory: string | null
  country: string
  city: string | null
  region: string | null
  budgetMin: number
  budgetMax: number
  currency: string
  timeline: string
  skills: string
  source: string
  sourceUrl: string | null
  clientName: string
  clientCompany: string | null
  clientEmail: string
  clientPhone: string | null
  clientAddress: string | null
  clientLinkedin: string | null
  clientWebsite: string | null
  experienceReq: string | null
  projectType: string | null
  status: string
  urgent: number
  featured: number
  views: number
  createdAt: string
  updatedAt: string
}

function rowToLead(row: Record<string, unknown>): LeadRow {
  return row as unknown as LeadRow
}

export async function tursoFindLeads(opts: {
  status?: string
  country?: string
  region?: string
  category?: string
  subcategory?: string
  search?: string
  urgent?: boolean
  featured?: boolean
  sort?: string
  minBudget?: number
  maxBudget?: number
  source?: string
  today?: boolean
}): Promise<LeadRow[]> {
  const db = getClient()
  const conditions: string[] = []
  const params: Record<string, string | number> = {}

  if (opts.status) { conditions.push(`"status" = @status`); params.status = opts.status }
  if (opts.country && opts.country !== 'ALL') { conditions.push(`"country" = @country`); params.country = opts.country }
  if (opts.region && opts.region !== 'ALL') { conditions.push(`"region" = @region`); params.region = opts.region }
  if (opts.category && opts.category !== 'ALL') { conditions.push(`"category" = @category`); params.category = opts.category }
  if (opts.subcategory) { conditions.push(`"subcategory" = @subcategory`); params.subcategory = opts.subcategory }
  if (opts.source && opts.source !== 'ALL') { conditions.push(`"source" = @source`); params.source = opts.source }
  if (opts.urgent) { conditions.push(`"urgent" = 1`) }
  if (opts.featured) { conditions.push(`"featured" = 1`) }

  if (opts.today) {
    conditions.push(`date("createdAt") = date('now')`)
  }

  if (opts.search) {
    const term = `%${opts.search}%`
    conditions.push(`("title" LIKE @search1 OR "description" LIKE @search2 OR "skills" LIKE @search3 OR "city" LIKE @search4 OR "subcategory" LIKE @search5 OR "clientName" LIKE @search6 OR "clientCompany" LIKE @search7)`)
    params.search1 = term
    params.search2 = term
    params.search3 = term
    params.search4 = term
    params.search5 = term
    params.search6 = term
    params.search7 = term
  }

  if (opts.minBudget) {
    conditions.push(`"budgetMax" >= @minBudget`)
    params.minBudget = opts.minBudget
  }
  if (opts.maxBudget) {
    conditions.push(`"budgetMin" <= @maxBudget`)
    params.maxBudget = opts.maxBudget
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  let orderBy = 'ORDER BY "createdAt" DESC'
  if (opts.sort === 'budget_high') orderBy = 'ORDER BY "budgetMax" DESC'
  else if (opts.sort === 'budget_low') orderBy = 'ORDER BY "budgetMin" ASC'

  const sql = `SELECT * FROM "Lead" ${where} ${orderBy} LIMIT 100`
  const result = await db.execute({ sql, args: params })
  return result.rows.map(rowToLead)
}

export async function tursoFindLeadById(id: string): Promise<LeadRow | null> {
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT * FROM "Lead" WHERE "id" = @id',
    args: { id },
  })
  return result.rows.length > 0 ? rowToLead(result.rows[0] as Record<string, unknown>) : null
}

export async function tursoCreateLead(data: Record<string, unknown>): Promise<LeadRow> {
  const db = getClient()
  const id = data.id || `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO "Lead" ("id","title","description","category","subcategory","country","city","region","budgetMin","budgetMax","currency","timeline","skills","source","sourceUrl","clientName","clientCompany","clientEmail","clientPhone","clientAddress","clientLinkedin","clientWebsite","experienceReq","projectType","status","urgent","featured","views","createdAt","updatedAt") VALUES (@id,@title,@description,@category,@subcategory,@country,@city,@region,@budgetMin,@budgetMax,@currency,@timeline,@skills,@source,@sourceUrl,@clientName,@clientCompany,@clientEmail,@clientPhone,@clientAddress,@clientLinkedin,@clientWebsite,@experienceReq,@projectType,@status,@urgent,@featured,0,@createdAt,@updatedAt)`,
    args: {
      id,
      title: String(data.title),
      description: String(data.description),
      category: String(data.category),
      subcategory: data.subcategory ? String(data.subcategory) : null,
      country: String(data.country),
      city: data.city ? String(data.city) : null,
      region: data.region ? String(data.region) : null,
      budgetMin: Number(data.budgetMin) || 0,
      budgetMax: Number(data.budgetMax) || 0,
      currency: String(data.currency || 'USD'),
      timeline: String(data.timeline),
      skills: String(data.skills),
      source: String(data.source || 'direct'),
      sourceUrl: data.sourceUrl ? String(data.sourceUrl) : null,
      clientName: String(data.clientName),
      clientCompany: data.clientCompany ? String(data.clientCompany) : null,
      clientEmail: String(data.clientEmail),
      clientPhone: data.clientPhone ? String(data.clientPhone) : null,
      clientAddress: data.clientAddress ? String(data.clientAddress) : null,
      clientLinkedin: data.clientLinkedin ? String(data.clientLinkedin) : null,
      clientWebsite: data.clientWebsite ? String(data.clientWebsite) : null,
      experienceReq: data.experienceReq ? String(data.experienceReq) : null,
      projectType: data.projectType ? String(data.projectType) : null,
      status: String(data.status || 'OPEN'),
      urgent: data.urgent ? 1 : 0,
      featured: 0,
      createdAt: now,
      updatedAt: now,
    },
  })

  return (await tursoFindLeadById(id))!
}

export async function tursoGetAnalytics() {
  const db = getClient()
  const [leadsResult, categoriesResult, regionsResult, sourcesResult] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\''),
    db.execute('SELECT "category", COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\' GROUP BY "category"'),
    db.execute('SELECT "region", COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\' GROUP BY "region"'),
    db.execute('SELECT "source", COUNT(*) as c FROM "Lead" WHERE "status" = \'OPEN\' GROUP BY "source"'),
  ])

  const totalLeads = Number(leadsResult.rows[0]?.c || 0)
  const categories: Record<string, number> = {}
  for (const row of categoriesResult.rows) {
    categories[String(row.category)] = Number(row.c)
  }
  const regions: Record<string, number> = {}
  for (const row of regionsResult.rows) {
    regions[String(row.region)] = Number(row.c)
  }
  const sources: Record<string, number> = {}
  for (const row of sourcesResult.rows) {
    sources[String(row.source)] = Number(row.c)
  }

  return { totalLeads, categories, regions, sources }
}