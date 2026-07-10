import {
  DEFAULT_EMAIL_ROUTES,
  getDefaultRouteSettings,
  getEmailRouteForCategory,
  type EmailRoute,
  type EmailRouteId,
} from '@/lib/email-routing'

export type ServerEmailConfig = {
  route: EmailRoute
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
  fromEmail: string
  fromName: string
}

const ROUTE_ENV_PREFIXES: Record<EmailRouteId, string[]> = {
  design: ['DESIGN'],
  fitout: ['FITOUT'],
  approvals: ['APPROVALS', 'UAE_APPROVALS'],
  finance: ['FINANCE'],
  logistics: ['LOGISTICS'],
}

function cleanEnv(value: string | undefined): string {
  return value?.trim() || ''
}

function getRoute(routeId?: string, category?: string): EmailRoute {
  const routeById = DEFAULT_EMAIL_ROUTES.find((route) => route.id === routeId)
  if (routeById) return routeById

  return getEmailRouteForCategory(category || '', DEFAULT_EMAIL_ROUTES)
}

function getRouteEnv(routeId: EmailRouteId, suffix: string): string {
  for (const prefix of ROUTE_ENV_PREFIXES[routeId]) {
    const value = cleanEnv(process.env[`${prefix}_${suffix}`])
    if (value) return value
  }

  return ''
}

function getGlobalEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = cleanEnv(process.env[key])
    if (value) return value
  }

  return ''
}

export function getServerEmailConfig({
  routeId,
  category,
}: {
  routeId?: string
  category?: string
}): ServerEmailConfig | null {
  const route = getRoute(routeId, category)
  const defaults = getDefaultRouteSettings(route)

  const smtpHost =
    getRouteEnv(route.id, 'SMTP_HOST') || getGlobalEnv('SMTP_HOST', 'EMAIL_SMTP_HOST')
  const smtpPort =
    getRouteEnv(route.id, 'SMTP_PORT') || getGlobalEnv('SMTP_PORT', 'EMAIL_SMTP_PORT') || defaults.smtpPort
  const smtpUser =
    getRouteEnv(route.id, 'SMTP_USER') || getGlobalEnv('SMTP_USER', 'EMAIL_SMTP_USER')
  const smtpPass =
    getRouteEnv(route.id, 'SMTP_PASS') || getGlobalEnv('SMTP_PASS', 'EMAIL_SMTP_PASS')
  const fromEmail =
    getRouteEnv(route.id, 'FROM_EMAIL') ||
    getGlobalEnv('SMTP_FROM_EMAIL', 'EMAIL_FROM') ||
    smtpUser ||
    route.email
  const fromName =
    getRouteEnv(route.id, 'FROM_NAME') ||
    getGlobalEnv('SMTP_FROM_NAME', 'EMAIL_FROM_NAME') ||
    defaults.fromName

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null
  }

  return {
    route,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    fromEmail,
    fromName,
  }
}

export function getConfiguredServerEmailRouteIds(): EmailRouteId[] {
  return DEFAULT_EMAIL_ROUTES
    .filter((route) => getServerEmailConfig({ routeId: route.id }) !== null)
    .map((route) => route.id)
}
