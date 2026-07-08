import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import {
  extractEmails,
  extractPhones,
  normalizeEmail,
  normalizePublicUrl,
} from '@/lib/lead-quality'
import { proxyToLiveApi, shouldProxyToLiveApi } from '@/lib/live-api-proxy'

export const dynamic = 'force-dynamic'

type LeadCandidate = Record<string, unknown>

type ContactEvidence = {
  emails: string[]
  phones: string[]
  pageChecked: boolean
  evidenceUrl: string | null
  hasUaeSignal: boolean
  hasNonUaeSignal: boolean
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

type MarketScope = 'global' | 'uae'

const UAE_ONLY_CATEGORIES = new Set([
  'FITOUT',
  'FINANCE',
  'LOGISTICS',
  'UAE_APPROVALS',
  'BUSINESS_SETUP',
  'ADVERTISING',
])

function getMarketScope(category: string): MarketScope {
  return UAE_ONLY_CATEGORIES.has(category) ? 'uae' : 'global'
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
      'interior design project hiring 2025',
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
      'graphic design project hiring 2025',
      'Dubai brand identity design company required',
      'Saudi Arabia logo design agency looking',
      'UAE packaging design project needed',
      'Middle East marketing material design tender',
    ],
    TECHNICAL_DESIGN: [
      'CAD drafting project hiring',
      'Dubai MEP design consultant required',
      'Saudi Arabia structural design engineer needed',
      'UAE shop drawing preparation company looking',
      'Middle East architecture technical drawing tender',
    ],
    SOFTWARE_DEV: [
      'software development project hiring 2025',
      'Dubai web development company looking',
      'Saudi Arabia mobile app development required',
      'UAE custom software development tender',
      'Middle East ERP system implementation project needed',
    ],
    FITOUT: [
      'UAE fit-out project tender 2025',
      'Dubai restaurant renovation contractor required',
      'Abu Dhabi office fit-out quotation request',
      'Sharjah retail shop fitout company needed',
      'UAE commercial fitout contractor contact email',
    ],
    FINANCE: [
      'UAE business loan required 2025',
      'Dubai credit card application salary transfer',
      'Mortgage UAE expat looking',
      'Abu Dhabi business financing required',
      'UAE SME loan application project',
    ],
    LOGISTICS: [
      'UAE freight forwarding company hiring 2025',
      'Dubai warehousing and storage required',
      'Abu Dhabi last mile delivery company looking',
      'UAE cold chain logistics project needed',
      'Sharjah e-commerce fulfillment company contact',
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
      'Abu Dhabi company registration consultant contact',
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
      'Sharjah advertising agency project contact',
      'UAE vehicle branding and wrap service hiring',
    ],
  }

  if (queries[category]) return queries[category]

  return getMarketScope(category) === 'uae'
    ? [
        `${category} project hiring UAE 2025`,
        `Dubai ${category} company looking for services`,
        `UAE ${category} tender quotation request`,
      ]
    : [
        `${category} project hiring 2025`,
        `${category} company looking for services worldwide`,
        `${category} tender quotation request`,
      ]
}

function getContactDiscoveryQueries(category: string, scope: MarketScope): string[] {
  const terms: Record<string, string[]> = {
    INTERIOR_DESIGN: ['interior design studio', 'villa interior designer'],
    VISUALIZATION_3D: ['3D rendering studio', 'architectural visualization company'],
    DESIGN_SERVICES: ['branding agency', 'graphic design studio'],
    TECHNICAL_DESIGN: ['CAD drafting company', 'MEP design consultant'],
    SOFTWARE_DEV: ['software development company', 'web development agency'],
    FITOUT: ['fit out contractor', 'interior fit out company'],
    FINANCE: ['finance broker', 'business finance consultant'],
    LOGISTICS: ['freight forwarding company', 'logistics company'],
    UAE_APPROVALS: ['approval consultant', 'DCD approval consultant'],
    BUSINESS_SETUP: ['business setup consultant', 'company formation consultant'],
    VIRAL_PRODUCTS: ['ecommerce supplier', 'wholesale product distributor'],
    INVESTMENT: ['investment company', 'real estate investment company'],
    REAL_ESTATE: ['real estate developer', 'property management company'],
    INVESTORS: ['family office', 'venture capital firm'],
    ADVERTISING: ['signage company', 'advertising production company'],
  }

  const [primary, secondary = primary] = terms[category] || [
    category.toLowerCase().replace(/_/g, ' '),
  ]

  if (scope === 'global') {
    return Array.from(
      new Set([
        `${primary} contact email`,
        `${primary} company contact us email`,
        `United States ${primary} contact email`,
        `United Kingdom ${secondary} contact email`,
        `Singapore ${primary} company email`,
        `UAE ${primary} contact email`,
      ]),
    )
  }

  return Array.from(
    new Set([
      `Dubai ${primary} contact email`,
      `UAE ${primary} contact us email`,
      `site:.ae "${primary}" "email"`,
      `Abu Dhabi ${secondary} contact email`,
      `Sharjah ${primary} company email`,
    ]),
  )
}

// ---------------------------------------------------------------------------
// LLM system prompt for lead extraction
// ---------------------------------------------------------------------------
function buildSystemPrompt(category: string, scope: MarketScope): string {
  const targetMarket =
    scope === 'uae'
      ? `Target market:
- Focus on UAE local leads only: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain, Al Ain, and UAE free zones
- Set country to "AE" for every accepted lead
- Set region to "GCC"
- Do not return Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, UK, India, Singapore, or worldwide leads unless the source clearly shows a UAE office/contact and the lead is for the UAE market`
      : `Target market:
- Worldwide leads are allowed for this category, especially design and digital work
- Use the real country and region shown by the source page
- Do not force the country to UAE unless the source clearly shows a UAE office/contact or UAE project`

  return `You are a lead generation AI for AB Kreative, a UAE-based lead generation company.
Extract business leads from the provided web search results. Return ONLY valid JSON in the exact shape requested by the user message — no markdown, no explanation.

${targetMarket}

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
- Generic business inboxes such as info@real-domain.com are allowed only when found verbatim on the public source page; never infer an email from a domain
- Do NOT use placeholder or guessed emails such as contact@company.com, info@company.com, hello@company.com, sales@company.com, or any email inferred from a domain
- Skip any lead that does not include both a traceable sourceUrl and a real contact email visible in the results
- If an active project/tender is not visible, a verified prospect company/contact page is valid. In that case, describe the lead as a prospect opportunity without inventing a requested project.
- If no genuine leads can be extracted from the results, return an empty result in the requested JSON shape
- For UAE-only categories, set "AE" as the country and "GCC" as the region. For worldwide categories, set the real country and region from the source.
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

function buildGeminiPrompt(
  category: string,
  query: string,
  requestedCount: number,
  scope: MarketScope,
): string {
  const marketLabel = scope === 'uae' ? 'UAE' : 'worldwide'
  const marketInstruction =
    scope === 'uae'
      ? 'Prefer active RFQs, tenders, hiring notices, or service requests in Dubai, Abu Dhabi, Sharjah, or another UAE emirate. If those are not visible, return verified UAE prospect companies whose public contact/about page shows a real email and whose business context matches this category.'
      : 'Prefer active RFQs, tenders, hiring notices, or service requests from any country. If those are not visible, return verified worldwide prospect companies whose public contact/about page shows a real email and whose business context matches this category.'

  return `${buildSystemPrompt(category, scope)}

Use Google Search to find current ${marketLabel} public business leads for this query:
"${query}"

Return a JSON object with exactly this shape:
{"leads":[ ...lead objects... ]}

Find at most ${requestedCount} ${marketLabel} leads for this query. ${marketInstruction} The sourceUrl must be the public page where the opportunity/contact evidence was found. The clientEmail must be visible on that exact source page. If you cannot find verified contact evidence for the target market, return {"leads":[]}.`
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

const UAE_LOCATION_RE =
  /\b(UAE|United Arab Emirates|Dubai|Abu Dhabi|Sharjah|Ajman|Ras Al Khaimah|RAK|Fujairah|Umm Al Quwain|Al Ain|Jebel Ali|Business Bay|Deira|JLT|DIFC|Dubai Marina|Al Quoz|Mussafah)\b/i

const NON_UAE_LOCATION_RE =
  /\b(Saudi Arabia|KSA|Riyadh|Jeddah|Qatar|Doha|Kuwait|Bahrain|Manama|Oman|Muscat|London|United Kingdom|UK|India|Mumbai|Delhi|Singapore|United States|USA)\b/i

function hasUaeSignal(text: string): boolean {
  if (UAE_LOCATION_RE.test(text)) return true

  try {
    return new URL(text).hostname.toLowerCase().endsWith('.ae')
  } catch {
    return false
  }
}

function hasNonUaeSignal(text: string): boolean {
  return NON_UAE_LOCATION_RE.test(text)
}

function normalizeCountry(value: unknown, context = ''): string {
  const country = asString(value)
  const text = `${country}\n${context}`
  const aliases: Array<[RegExp, string]> = [
    [/\b(UAE|United Arab Emirates|Dubai|Abu Dhabi|Sharjah|Ajman|Ras Al Khaimah|RAK|Fujairah|Umm Al Quwain|Al Ain)\b/i, 'AE'],
    [/\b(Saudi Arabia|KSA|Riyadh|Jeddah)\b/i, 'SA'],
    [/\b(Qatar|Doha)\b/i, 'QA'],
    [/\b(Kuwait)\b/i, 'KW'],
    [/\b(Bahrain|Manama)\b/i, 'BH'],
    [/\b(Oman|Muscat)\b/i, 'OM'],
    [/\b(United Kingdom|UK|London|England|Scotland|Wales)\b/i, 'GB'],
    [/\b(United States|USA|US|New York|California|Texas|Florida)\b/i, 'US'],
    [/\b(India|Mumbai|Delhi|Bangalore|Bengaluru)\b/i, 'IN'],
    [/\b(Singapore)\b/i, 'SG'],
    [/\b(Australia|Sydney|Melbourne)\b/i, 'AU'],
    [/\b(Germany|Berlin)\b/i, 'DE'],
    [/\b(France|Paris)\b/i, 'FR'],
    [/\b(Netherlands|Amsterdam)\b/i, 'NL'],
  ]

  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase()

  for (const [pattern, code] of aliases) {
    if (pattern.test(text)) return code
  }

  return 'AE'
}

function normalizeRegion(country: string, value: unknown): string {
  const region = asString(value)
  if (region) return region

  if (['AE', 'SA', 'QA', 'KW', 'BH', 'OM'].includes(country)) return 'GCC'
  if (['GB', 'DE', 'FR', 'NL'].includes(country)) return 'Europe'
  if (['US', 'CA'].includes(country)) return 'North America'
  if (['SG', 'AU'].includes(country)) return 'Asia Pacific'
  if (country === 'IN') return 'South Asia'

  return 'GCC'
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

async function fetchEvidencePage(
  sourceUrl: string,
  timeoutMs: number,
): Promise<{ text: string; finalUrl: string } | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

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
      return { text: '', finalUrl: response.url || sourceUrl }
    }

    const text = (await response.text()).slice(0, 500_000)
    return { text, finalUrl: response.url || sourceUrl }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function extractSameSiteContactLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl)
  const links: string[] = []
  const hrefRe = /href=["']([^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = hrefRe.exec(html))) {
    const href = match[1]
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue

    try {
      const url = new URL(href, base)
      const normalized = normalizePublicUrl(url.toString())
      if (!normalized) continue

      const normalizedUrl = new URL(normalized)
      if (normalizedUrl.origin !== base.origin) continue

      const path = `${normalizedUrl.pathname} ${normalizedUrl.search}`.toLowerCase()
      if (!/(contact|contact-us|contactus|get-in-touch|enquiry|inquiry|about)/i.test(path)) {
        continue
      }

      links.push(normalized)
    } catch {
      continue
    }
  }

  return unique(links).slice(0, 4)
}

async function getPageEvidence(sourceUrl: string): Promise<ContactEvidence> {
  const sourcePage = await fetchEvidencePage(sourceUrl, 5_000)
  if (!sourcePage) {
    return {
      emails: [],
      phones: [],
      pageChecked: false,
      evidenceUrl: null,
      hasUaeSignal: hasUaeSignal(sourceUrl),
      hasNonUaeSignal: hasNonUaeSignal(sourceUrl),
    }
  }

  const sourceEmails = extractEmails(sourcePage.text)
  let phones = extractPhones(sourcePage.text)
  let hasUae = hasUaeSignal(`${sourcePage.finalUrl}\n${sourcePage.text}`)
  let hasNonUae = hasNonUaeSignal(`${sourcePage.finalUrl}\n${sourcePage.text}`)

  if (sourceEmails.length > 0) {
    return {
      emails: sourceEmails,
      phones,
      pageChecked: true,
      evidenceUrl: sourcePage.finalUrl,
      hasUaeSignal: hasUae,
      hasNonUaeSignal: hasNonUae,
    }
  }

  const contactLinks = extractSameSiteContactLinks(sourcePage.text, sourcePage.finalUrl)
  for (const contactUrl of contactLinks) {
    const contactPage = await fetchEvidencePage(contactUrl, 4_000)
    if (!contactPage) continue

    const contactEmails = extractEmails(contactPage.text)
    const contactPhones = extractPhones(contactPage.text)
    phones = unique([...phones, ...contactPhones])
    hasUae = hasUae || hasUaeSignal(`${contactPage.finalUrl}\n${contactPage.text}`)
    hasNonUae = hasNonUae || hasNonUaeSignal(`${contactPage.finalUrl}\n${contactPage.text}`)

    if (contactEmails.length > 0) {
      return {
        emails: contactEmails,
        phones,
        pageChecked: true,
        evidenceUrl: contactPage.finalUrl,
        hasUaeSignal: hasUae,
        hasNonUaeSignal: hasNonUae,
      }
    }
  }

  return {
    emails: [],
    phones,
    pageChecked: true,
    evidenceUrl: sourcePage.finalUrl,
    hasUaeSignal: hasUae,
    hasNonUaeSignal: hasNonUae,
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

function normalizeUaeCity(value: unknown, context: string): string | null {
  const text = `${asString(value)}\n${context}`
  const cityPatterns: Array<[RegExp, string]> = [
    [/\bDubai\b/i, 'Dubai'],
    [/\bAbu Dhabi\b/i, 'Abu Dhabi'],
    [/\bSharjah\b/i, 'Sharjah'],
    [/\bAjman\b/i, 'Ajman'],
    [/\bRas Al Khaimah\b|\bRAK\b/i, 'Ras Al Khaimah'],
    [/\bFujairah\b/i, 'Fujairah'],
    [/\bUmm Al Quwain\b/i, 'Umm Al Quwain'],
    [/\bAl Ain\b/i, 'Al Ain'],
  ]

  for (const [pattern, city] of cityPatterns) {
    if (pattern.test(text)) return city
  }

  const city = asString(value)
  return city && !hasNonUaeSignal(city) ? city : null
}

function hasVerifiedUaeLocation(
  rawLead: LeadCandidate,
  sourceUrl: string,
  evidence: ContactEvidence,
): boolean {
  const locationText = [
    rawLead.title,
    rawLead.description,
    rawLead.country,
    rawLead.city,
    rawLead.region,
    rawLead.clientCompany,
    sourceUrl,
    evidence.evidenceUrl,
  ]
    .map((value) => (typeof value === 'string' ? value : ''))
    .join('\n')

  return evidence.hasUaeSignal || hasUaeSignal(locationText)
}

function buildVerifiedLead(
  rawLead: LeadCandidate,
  category: string,
  sourceUrl: string,
  clientEmail: string,
  clientPhone: string | null,
  scope: MarketScope,
): LeadCandidate | null {
  const title = asString(rawLead.title)
  const description = asString(rawLead.description)
  const skills = asString(rawLead.skills)
  const locationContext = [
    title,
    description,
    sourceUrl,
    rawLead.clientCompany,
    rawLead.sourceUrl,
  ]
    .map((value) => (typeof value === 'string' ? value : ''))
    .join('\n')

  if (!title || !description || !skills) return null

  const budgetMin = Math.max(0, Math.round(asNumber(rawLead.budgetMin, 0)))
  const budgetMax = Math.max(budgetMin, Math.round(asNumber(rawLead.budgetMax, budgetMin)))
  const country = scope === 'uae' ? 'AE' : normalizeCountry(rawLead.country, locationContext)

  return {
    ...rawLead,
    title,
    description,
    category,
    subcategory: asString(rawLead.subcategory) || null,
    country,
    city: scope === 'uae' ? normalizeUaeCity(rawLead.city, locationContext) : asString(rawLead.city) || null,
    region: scope === 'uae' ? 'GCC' : normalizeRegion(country, rawLead.region),
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
  scope: MarketScope,
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

    const verifiedSourceUrl = pageEvidence.evidenceUrl || sourceUrl
    if (scope === 'uae' && !hasVerifiedUaeLocation(rawLead, verifiedSourceUrl, pageEvidence)) {
      rejected++
      continue
    }

    const verifiedLead = buildVerifiedLead(
      rawLead,
      category,
      verifiedSourceUrl,
      clientEmail,
      selectVerifiedPhone(rawLead.clientPhone, evidencePhones),
      scope,
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
  const scope = getMarketScope(category)
  const queryPlan = unique([...getContactDiscoveryQueries(category, scope), ...searchQueries]).slice(0, 8)

  for (const query of queryPlan) {
    if (allLeads.length >= requestedCount) break
    queriesTried.push(query)

    const outputText = await callGeminiInteraction(
      buildGeminiPrompt(category, query, requestedCount - allLeads.length, scope),
    )
    const parsedLeads = parseLeadCandidates(outputText)
    const verified = await verifyLeadCandidates(parsedLeads, category, new Map(), scope)

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
  const scope = getMarketScope(category)

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
          content: buildSystemPrompt(category, scope),
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
    const verified = await verifyLeadCandidates(parsedLeads, category, searchEvidenceByUrl, scope)
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
  if (shouldProxyToLiveApi()) {
    return proxyToLiveApi(request, '/api/generate-leads')
  }

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
