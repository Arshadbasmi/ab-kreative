import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import {
  extractEmails,
  extractPhones,
  normalizeEmail,
  normalizePublicUrl,
} from '@/lib/lead-quality'

export const dynamic = 'force-dynamic'

type LeadCandidate = Record<string, unknown>

type ContactEvidence = {
  emails: string[]
  phones: string[]
  pageChecked: boolean
}

type SearchEvidence = {
  emails: string[]
  phones: string[]
}

type GenerationResult = {
  leads: LeadCandidate[]
  queriesTried: string[]
  rejectedCandidates: number
  pagesChecked: number
  provider: 'gemini' | 'zai'
}

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 10 calls per minute per IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  let entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitMap.set(ip, entry)
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

// ---------------------------------------------------------------------------
// Category-specific search queries (all 15 categories, 3-5 queries each)
// ---------------------------------------------------------------------------
function getSearchQueries(category: string): string[] {
  const queries: Record<string, string[]> = {
    INTERIOR_DESIGN: [
      'UAE interior design project hiring 2025',
      'Dubai villa interior design company looking',
      'Saudi Arabia residential interior design required',
      'Qatar hotel interior design contractor needed',
      'Abu Dhabi luxury apartment interior design tender',
    ],
    VISUALIZATION_3D: [
      'UAE 3D visualization project hiring',
      'Dubai 3D rendering company looking',
      'Saudi Arabia architectural visualization required',
      'UAE 3D walkthrough animation project needed',
      'Middle East real estate 3D visualization tender',
    ],
    DESIGN_SERVICES: [
      'UAE graphic design project hiring 2025',
      'Dubai brand identity design company required',
      'Saudi Arabia logo design agency looking',
      'UAE packaging design project needed',
      'Middle East marketing material design tender',
    ],
    TECHNICAL_DESIGN: [
      'UAE CAD drafting project hiring',
      'Dubai MEP design consultant required',
      'Saudi Arabia structural design engineer needed',
      'UAE shop drawing preparation company looking',
      'Middle East architecture technical drawing tender',
    ],
    SOFTWARE_DEV: [
      'UAE software development project hiring 2025',
      'Dubai web development company looking',
      'Saudi Arabia mobile app development required',
      'UAE custom software development tender',
      'Middle East ERP system implementation project needed',
    ],
    FITOUT: [
      'UAE fit-out project tender 2025',
      'Dubai restaurant renovation contractor required',
      'Abu Dhabi office fit-out quotation request',
      'Saudi Arabia retail shop fitout company needed',
      'Jeddah commercial fitout project hiring',
    ],
    FINANCE: [
      'UAE business loan required 2025',
      'Dubai credit card application salary transfer',
      'Mortgage UAE expat looking',
      'Saudi Arabia business financing required',
      'UAE SME loan application project',
    ],
    LOGISTICS: [
      'UAE freight forwarding company hiring 2025',
      'Dubai warehousing and storage required',
      'Saudi Arabia last mile delivery company looking',
      'UAE cold chain logistics project needed',
      'Middle East e-commerce fulfillment tender',
    ],
    UAE_APPROVALS: [
      'UAE municipality approval service required',
      'Dubai Civil Defense DCD approval consultant',
      'DEWA connection approval project Dubai',
      'Trakhees approval service company needed',
      'Abu Dhabi building permit ADCD application',
    ],
    BUSINESS_SETUP: [
      'Dubai company formation service required 2025',
      'UAE free zone business setup looking',
      'Saudi Arabia company registration project needed',
      'Dubai mainland license company hiring',
      'UAE visa processing business setup tender',
    ],
    VIRAL_PRODUCTS: [
      'UAE trending products wholesale 2025',
      'Dubai viral gadgets supplier required',
      'Saudi Arabia e-commerce product sourcing',
      'Middle East dropshipping product lookup',
      'UAE social media viral product distributor',
    ],
    INVESTMENT: [
      'UAE investment opportunity looking 2025',
      'Dubai real estate investment project',
      'Saudi Arabia startup investment required',
      'UAE business investment fund looking',
      'Middle East angel investor opportunity',
    ],
    REAL_ESTATE: [
      'UAE real estate project hiring 2025',
      'Dubai property management company looking',
      'Saudi Arabia real estate development required',
      'UAE property marketing agency needed',
      'Middle East real estate brokerage tender',
    ],
    INVESTORS: [
      'UAE investor looking for business opportunity 2025',
      'Dubai venture capital firm portfolio companies',
      'Saudi Arabia angel investor startup funding',
      'Middle East private equity investment lead',
      'UAE family office investment mandate',
    ],
    ADVERTISING: [
      'UAE printing company signboard required',
      'Dubai shop signage approval company looking',
      'Abu Dhabi corporate uniform supplier needed',
      'Saudi Arabia advertising agency project tender',
      'UAE vehicle branding and wrap service hiring',
    ],
  }

  return queries[category] || [
    `${category} project hiring UAE 2025`,
    `Dubai ${category} company looking for services`,
    `UAE ${category} tender quotation request`,
  ]
}

// ---------------------------------------------------------------------------
// LLM system prompt for lead extraction
// ---------------------------------------------------------------------------
function buildSystemPrompt(category: string): string {
  return `You are a lead generation AI for AB Kreative, a UAE-based lead generation company.
Extract business leads from the provided web search results. Return ONLY a valid JSON array of lead objects — no markdown, no explanation, just the raw JSON array.

Each lead object MUST have these fields:
- title: string (short project title)
- description: string (2-3 sentence project description)
- category: string (must be "${category}")
- subcategory: string (pick the most relevant subcategory for this category)
- country: string (ISO-2 country code, default "AE" if unclear)
- city: string (city name or null)
- region: string (GCC / MENA / Europe / North America / Asia Pacific / South Asia / Africa / Latin America / Oceania)
- budgetMin: number (minimum budget in USD, realistic)
- budgetMax: number (maximum budget in USD, realistic)
- currency: string ("USD")
- timeline: string (one of: "1-2 weeks", "2-4 weeks", "4-6 weeks", "6-8 weeks", "8-12 weeks", "12+ weeks", "Monthly retainer")
- skills: string (comma-separated list of relevant skills/services needed)
- source: string ("website_scraped")
- sourceUrl: string (the exact public URL from the search result)
- clientName: string (contact person name, or "Not specified" only if no person is listed)
- clientCompany: string (company name from the search result, or null)
- clientEmail: string (real email found verbatim in the provided results; never guess)
- clientPhone: string (phone found verbatim in the provided results, or null)

Rules:
- Set realistic budgets based on the project scope (e.g., fitout projects $10K-$500K+, design $2K-$50K, finance leads $0 budget range, etc.)
- Only extract leads that are genuinely implied by the search results
- Do NOT fabricate fake company names, contacts, emails, phone numbers, URLs, or project details
- Do NOT use placeholder or guessed emails such as contact@company.com, info@company.com, hello@company.com, sales@company.com, or any email inferred from a domain
- Skip any lead that does not include both a traceable sourceUrl and a real contact email visible in the results
- If no genuine leads can be extracted from the results, return an empty array []
- Set "AE" as the default country and "GCC" as the default region if location is unclear
- Return valid JSON only — no backticks, no markdown code fences`
}

function getLeadResponseSchema() {
  const leadProperties = {
    title: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    subcategory: { type: 'string' },
    country: { type: 'string' },
    city: { type: 'string', nullable: true },
    region: { type: 'string' },
    budgetMin: { type: 'integer' },
    budgetMax: { type: 'integer' },
    currency: { type: 'string' },
    timeline: { type: 'string' },
    skills: { type: 'string' },
    source: { type: 'string' },
    sourceUrl: { type: 'string' },
    clientName: { type: 'string' },
    clientCompany: { type: 'string', nullable: true },
    clientEmail: { type: 'string' },
    clientPhone: { type: 'string', nullable: true },
  }

  return {
    type: 'object',
    properties: {
      leads: {
        type: 'array',
        items: {
          type: 'object',
          properties: leadProperties,
          required: Object.keys(leadProperties),
        },
      },
    },
    required: ['leads'],
  }
}

function buildGeminiPrompt(category: string, query: string, requestedCount: number): string {
  return `${buildSystemPrompt(category)}

Use Google Search to find current public business leads for this query:
"${query}"

Return a JSON object with exactly this shape:
{"leads":[ ...lead objects... ]}

Find at most ${requestedCount} leads for this query. The sourceUrl must be the public page where the opportunity/contact evidence was found. The clientEmail must be visible on that exact source page. If you cannot find verified contact evidence, return {"leads":[]}.`
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown, fallback: number): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)))
}

function parseLeadCandidates(content: string): LeadCandidate[] {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed as LeadCandidate[]
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.leads)) {
      return parsed.leads as LeadCandidate[]
    }
  } catch {
    const objectMatch = content.match(/\{[\s\S]*\}/)
    const arrayMatch = content.match(/\[[\s\S]*\]/)
    const jsonText = objectMatch?.[0] || arrayMatch?.[0]

    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText)
        if (Array.isArray(parsed)) return parsed as LeadCandidate[]
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.leads)) {
          return parsed.leads as LeadCandidate[]
        }
      } catch {
        return []
      }
    }
  }

  return []
}

function buildSearchEvidence(searchResults: Array<Record<string, unknown>>): Map<string, SearchEvidence> {
  const evidenceByUrl = new Map<string, SearchEvidence>()

  for (const result of searchResults) {
    const url = normalizePublicUrl(result.url)
    if (!url) continue

    const resultText = [
      result.name,
      result.title,
      result.snippet,
      result.description,
      result.url,
    ]
      .map((value) => (typeof value === 'string' ? value : ''))
      .join('\n')

    evidenceByUrl.set(url, {
      emails: extractEmails(resultText),
      phones: extractPhones(resultText),
    })
  }

  return evidenceByUrl
}

function normalizeCountry(value: unknown): string {
  const country = asString(value)
  const aliases: Record<string, string> = {
    UAE: 'AE',
    'United Arab Emirates': 'AE',
    Dubai: 'AE',
    'Saudi Arabia': 'SA',
    KSA: 'SA',
    Qatar: 'QA',
    Kuwait: 'KW',
    Bahrain: 'BH',
    Oman: 'OM',
    'United Kingdom': 'GB',
    UK: 'GB',
    'United States': 'US',
    USA: 'US',
    India: 'IN',
    Singapore: 'SG',
    Australia: 'AU',
  }

  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase()
  return aliases[country] || 'AE'
}

async function getPageEvidence(sourceUrl: string): Promise<ContactEvidence> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)

  try {
    const response = await fetch(sourceUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        accept: 'text/html,text/plain,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'AB-Kreative-Lead-Verifier/1.0',
      },
    })

    const contentType = response.headers.get('content-type') || ''
    if (!response.ok || !/(html|text|json|xml)/i.test(contentType)) {
      return { emails: [], phones: [], pageChecked: true }
    }

    const text = (await response.text()).slice(0, 500_000)
    return {
      emails: extractEmails(text),
      phones: extractPhones(text),
      pageChecked: true,
    }
  } catch {
    return { emails: [], phones: [], pageChecked: false }
  } finally {
    clearTimeout(timeout)
  }
}

function selectVerifiedEmail(candidateEmail: unknown, evidenceEmails: string[]): string | null {
  const claimedEmail = normalizeEmail(candidateEmail)

  if (claimedEmail && evidenceEmails.includes(claimedEmail)) {
    return claimedEmail
  }

  return evidenceEmails[0] || null
}

function selectVerifiedPhone(candidatePhone: unknown, evidencePhones: string[]): string | null {
  const phone = asString(candidatePhone)
  const phoneDigits = phone.replace(/\D/g, '')

  if (!phoneDigits || phoneDigits.length < 8) {
    return evidencePhones[0] || null
  }

  const verifiedPhone = evidencePhones.find((evidencePhone) => {
    const evidenceDigits = evidencePhone.replace(/\D/g, '')
    return evidenceDigits.includes(phoneDigits) || phoneDigits.includes(evidenceDigits)
  })

  return verifiedPhone || evidencePhones[0] || null
}

function buildVerifiedLead(
  rawLead: LeadCandidate,
  category: string,
  sourceUrl: string,
  clientEmail: string,
  clientPhone: string | null,
): LeadCandidate | null {
  const title = asString(rawLead.title)
  const description = asString(rawLead.description)
  const skills = asString(rawLead.skills)

  if (!title || !description || !skills) return null

  const budgetMin = Math.max(0, Math.round(asNumber(rawLead.budgetMin, 0)))
  const budgetMax = Math.max(budgetMin, Math.round(asNumber(rawLead.budgetMax, budgetMin)))

  return {
    ...rawLead,
    title,
    description,
    category,
    subcategory: asString(rawLead.subcategory) || null,
    country: normalizeCountry(rawLead.country),
    city: asString(rawLead.city) || null,
    region: asString(rawLead.region) || 'GCC',
    budgetMin,
    budgetMax,
    currency: 'USD',
    timeline: asString(rawLead.timeline) || '2-4 weeks',
    skills,
    source: 'website_scraped',
    sourceUrl,
    clientName: asString(rawLead.clientName) || 'Not specified',
    clientCompany: asString(rawLead.clientCompany) || null,
    clientEmail,
    clientPhone,
  }
}

async function verifyLeadCandidates(
  rawLeads: LeadCandidate[],
  category: string,
  searchEvidenceByUrl: Map<string, SearchEvidence>,
): Promise<{ leads: LeadCandidate[]; rejected: number; pagesChecked: number }> {
  const verifiedLeads: LeadCandidate[] = []
  let rejected = 0
  let pagesChecked = 0

  for (const rawLead of rawLeads) {
    const sourceUrl = normalizePublicUrl(rawLead.sourceUrl)
    if (!sourceUrl) {
      rejected++
      continue
    }

    const pageEvidence = await getPageEvidence(sourceUrl)
    if (pageEvidence.pageChecked) pagesChecked++

    const searchEvidence = searchEvidenceByUrl.get(sourceUrl) || { emails: [], phones: [] }
    const evidenceEmails = unique([...searchEvidence.emails, ...pageEvidence.emails])
    const evidencePhones = unique([...searchEvidence.phones, ...pageEvidence.phones])
    const clientEmail = selectVerifiedEmail(rawLead.clientEmail, evidenceEmails)

    if (!clientEmail) {
      rejected++
      continue
    }

    const verifiedLead = buildVerifiedLead(
      rawLead,
      category,
      sourceUrl,
      clientEmail,
      selectVerifiedPhone(rawLead.clientPhone, evidencePhones),
    )

    if (verifiedLead) {
      verifiedLeads.push(verifiedLead)
    } else {
      rejected++
    }
  }

  return { leads: verifiedLeads, rejected, pagesChecked }
}

function getGeminiOutputText(responseJson: Record<string, unknown>): string {
  if (typeof responseJson.output_text === 'string') {
    return responseJson.output_text
  }

  const steps = Array.isArray(responseJson.steps) ? responseJson.steps : []
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue
    const stepRecord = step as Record<string, unknown>
    if (stepRecord.type !== 'model_output') continue

    const content = Array.isArray(stepRecord.content) ? stepRecord.content : []
    const textBlocks = content
      .map((block) => {
        if (!block || typeof block !== 'object') return ''
        const blockRecord = block as Record<string, unknown>
        return blockRecord.type === 'text' && typeof blockRecord.text === 'string'
          ? blockRecord.text
          : ''
      })
      .filter(Boolean)

    if (textBlocks.length > 0) return textBlocks.join('\n')
  }

  return ''
}

async function callGeminiInteraction(input: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY is not configured')

  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
  const fallbackModels = ['gemini-2.5-flash']
  const models = Array.from(new Set([preferredModel, ...fallbackModels]))
  const errors: string[] = []

  for (const model of models) {
    const payloads = [
      {
        model,
        input,
        tools: [{ type: 'google_search' }],
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: getLeadResponseSchema(),
        },
      },
      {
        model,
        input: `${input}\n\nReturn only valid JSON. Do not wrap it in markdown.`,
        tools: [{ type: 'google_search' }],
      },
    ]

    for (const payload of payloads) {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      if (!response.ok) {
        errors.push(`Gemini ${model} failed: ${response.status} ${responseText.slice(0, 500)}`)
        continue
      }

      const responseJson = JSON.parse(responseText) as Record<string, unknown>
      return getGeminiOutputText(responseJson)
    }
  }

  throw new Error(errors.join(' | ') || 'Gemini request failed')
}

async function generateWithGemini(
  category: string,
  requestedCount: number,
  searchQueries: string[],
): Promise<GenerationResult> {
  const allLeads: LeadCandidate[] = []
  const queriesTried: string[] = []
  let rejectedCandidates = 0
  let pagesChecked = 0

  for (const query of searchQueries) {
    if (allLeads.length >= requestedCount) break
    queriesTried.push(query)

    const outputText = await callGeminiInteraction(
      buildGeminiPrompt(category, query, requestedCount - allLeads.length),
    )
    const parsedLeads = parseLeadCandidates(outputText)
    const verified = await verifyLeadCandidates(parsedLeads, category, new Map())

    allLeads.push(...verified.leads)
    rejectedCandidates += verified.rejected
    pagesChecked += verified.pagesChecked
  }

  return {
    leads: allLeads,
    queriesTried,
    rejectedCandidates,
    pagesChecked,
    provider: 'gemini',
  }
}

async function generateWithZai(
  category: string,
  requestedCount: number,
  searchQueries: string[],
): Promise<GenerationResult> {
  const zai = await ZAI.create()
  const allLeads: LeadCandidate[] = []
  const queriesTried: string[] = []
  let rejectedCandidates = 0
  let pagesChecked = 0

  for (const query of searchQueries) {
    if (allLeads.length >= requestedCount) break
    queriesTried.push(query)

    // Step 1: Web search for potential leads
    let searchResults: Array<Record<string, unknown>>
    try {
      searchResults = (await zai.functions.invoke('web_search', {
        query,
        num: 5,
      })) as unknown as Array<Record<string, unknown>>
    } catch {
      continue
    }

    if (!Array.isArray(searchResults) || searchResults.length === 0) continue

    // Step 2: Build context from search results
    const searchContext = searchResults
      .map((r) => `${r.name || r.title || ''}\n${r.snippet || r.description || ''}\n${r.url || ''}`)
      .join('\n\n')

    if (!searchContext.trim()) continue
    const searchEvidenceByUrl = buildSearchEvidence(searchResults)

    // Step 3: Use LLM to extract structured leads from search context
    const llmResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(category),
        },
        {
          role: 'user',
          content: `Search query: "${query}"\n\nSearch results:\n${searchContext}\n\nExtract all genuine business leads from these results as a JSON array.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const content = llmResponse.choices?.[0]?.message?.content || '[]'
    const parsedLeads = parseLeadCandidates(content)
    const verified = await verifyLeadCandidates(parsedLeads, category, searchEvidenceByUrl)
    allLeads.push(...verified.leads)
    rejectedCandidates += verified.rejected
    pagesChecked += verified.pagesChecked
  }

  return {
    leads: allLeads,
    queriesTried,
    rejectedCandidates,
    pagesChecked,
    provider: 'zai',
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 10 requests per minute.' },
      { status: 429 },
    )
  }

  const body = await request.json()
  const { category, count = 5 } = body

  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  const requestedCount = Math.min(Math.max(Number(count) || 5, 1), 10)
  const searchQueries = getSearchQueries(category)

  try {
    let generation: GenerationResult
    if (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
      generation = await generateWithGemini(category, requestedCount, searchQueries)
    } else {
      generation = await generateWithZai(category, requestedCount, searchQueries)
    }

    const seen = new Set<string>()
    const dedupedLeads = generation.leads.filter((lead) => {
      const key = [
        asString(lead.clientEmail).toLowerCase(),
        asString(lead.sourceUrl).toLowerCase(),
        asString(lead.title).toLowerCase(),
      ].join('|')

      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Take only the requested count and attach metadata
    const leads = dedupedLeads.slice(0, requestedCount).map((lead, idx) => ({
      ...lead,
      category,
      id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    }))

    return NextResponse.json({
      leads,
      count: leads.length,
      category,
      provider: generation.provider,
      queriesUsed: generation.queriesTried,
      quality: {
        accepted: leads.length,
        rejected: generation.rejectedCandidates,
        pagesChecked: generation.pagesChecked,
        requirement: 'Verified public source URL and non-placeholder contact email found in search/page evidence.',
      },
      message:
        leads.length === 0
          ? 'No verified leads found. The app rejected results without a traceable source URL and real contact email.'
          : undefined,
    })
  } catch (error) {
    console.error('Generate leads error:', error)
    return NextResponse.json(
      { error: 'Failed to generate leads', details: String(error) },
      { status: 500 },
    )
  }
}
