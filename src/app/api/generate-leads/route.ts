import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

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
- country: string (country code or full name, default "UAE" if unclear)
- city: string (city name or null)
- region: string (GCC / MENA / Europe / North America / Asia Pacific / South Asia / Africa / Latin America / Oceania)
- budgetMin: number (minimum budget in USD, realistic)
- budgetMax: number (maximum budget in USD, realistic)
- currency: string ("USD")
- timeline: string (one of: "1-2 weeks", "2-4 weeks", "4-6 weeks", "6-8 weeks", "8-12 weeks", "12+ weeks", "Monthly retainer")
- skills: string (comma-separated list of relevant skills/services needed)
- source: string ("website_scraped")
- sourceUrl: string (the URL from the search result, or null)
- clientName: string (contact person name, or "Not specified")
- clientCompany: string (company name from the search result, or null)
- clientEmail: string (email if found in results, or "contact@company.com" as placeholder)
- clientPhone: string (phone if found, or null)

Rules:
- Set realistic budgets based on the project scope (e.g., fitout projects $10K-$500K+, design $2K-$50K, finance leads $0 budget range, etc.)
- Only extract leads that are genuinely implied by the search results
- Do NOT fabricate fake company names, contacts, or project details
- If no genuine leads can be extracted from the results, return an empty array []
- Set "UAE" as the default country and "GCC" as the default region if location is unclear
- Return valid JSON only — no backticks, no markdown code fences`
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
    const zai = await ZAI.create()
    const allLeads: Record<string, unknown>[] = []

    for (const query of searchQueries) {
      if (allLeads.length >= requestedCount) break

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

      // Step 3: Use LLM to extract structured leads from search context
      const llmResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
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

      // Step 4: Parse JSON from LLM response
      try {
        // Try direct parse first
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          allLeads.push(...parsed)
        }
      } catch {
        // Fallback: extract JSON array from markdown code fences or mixed content
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (Array.isArray(parsed)) {
              allLeads.push(...parsed)
            }
          } catch {
            // Unparseable — skip this batch
          }
        }
      }

      if (allLeads.length >= requestedCount) break
    }

    // Take only the requested count and attach metadata
    const leads = allLeads.slice(0, requestedCount).map((lead, idx) => ({
      ...lead,
      source: 'ai_generated',
      category,
      id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    }))

    return NextResponse.json({
      leads,
      count: leads.length,
      category,
      queriesUsed: searchQueries.slice(0, Math.ceil(requestedCount / 2)),
    })
  } catch (error) {
    console.error('Generate leads error:', error)
    return NextResponse.json(
      { error: 'Failed to generate leads', details: String(error) },
      { status: 500 },
    )
  }
}