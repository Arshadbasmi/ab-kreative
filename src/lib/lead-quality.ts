const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const PHONE_RE = /(?:\+|00)?[0-9][0-9\s().-]{7,}[0-9]/g

const PLACEHOLDER_EMAILS = new Set([
  'contact@company.com',
  'info@company.com',
  'sales@company.com',
  'hello@company.com',
  'name@company.com',
  'user@company.com',
  'you@company.com',
  'test@example.com',
  'email@example.com',
  'user@example.com',
])

const PLACEHOLDER_DOMAINS = new Set([
  'company.com',
  'example.com',
  'example.org',
  'example.net',
  'domain.com',
  'yourcompany.com',
  'your-company.com',
  'website.com',
])

const BLOCKED_LOCAL_PARTS = new Set([
  'example',
  'sample',
  'test',
  'user',
  'username',
  'name',
  'you',
  'yourname',
])

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

export function isPlaceholderEmail(value: string): boolean {
  const email = value.trim().toLowerCase()
  const [localPart, domain] = email.split('@')

  return (
    PLACEHOLDER_EMAILS.has(email) ||
    PLACEHOLDER_DOMAINS.has(domain) ||
    domain.endsWith('.example') ||
    domain.includes('yourcompany') ||
    BLOCKED_LOCAL_PARTS.has(localPart)
  )
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const email = value.trim().toLowerCase()
  EMAIL_RE.lastIndex = 0
  if (!EMAIL_RE.test(email)) return null
  EMAIL_RE.lastIndex = 0
  if (isPlaceholderEmail(email)) return null

  return email
}

export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) || []
  EMAIL_RE.lastIndex = 0
  return unique(matches.map((email) => normalizeEmail(email)).filter(Boolean) as string[])
}

export function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_RE) || []

  return unique(
    matches
      .map((phone) => phone.replace(/\s+/g, ' ').trim())
      .filter((phone) => phone.replace(/\D/g, '').length >= 8),
  )
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false

  const [a, b] = parts
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  )
}

export function normalizePublicUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null

  try {
    const url = new URL(value.trim())
    const hostname = url.hostname.toLowerCase()

    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (BLOCKED_HOSTS.has(hostname)) return null
    if (hostname.endsWith('.local')) return null
    if (isPrivateIpv4(hostname)) return null

    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export function getLeadValidationIssues(lead: Record<string, unknown>): string[] {
  const issues: string[] = []

  if (!normalizePublicUrl(lead.sourceUrl)) {
    issues.push('A traceable public source URL is required.')
  }

  if (!normalizeEmail(lead.clientEmail)) {
    issues.push('A real, non-placeholder contact email is required.')
  }

  if (!String(lead.title || '').trim()) {
    issues.push('A lead title is required.')
  }

  if (!String(lead.description || '').trim()) {
    issues.push('A lead description is required.')
  }

  return issues
}
