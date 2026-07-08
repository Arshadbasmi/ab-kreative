export type EmailRouteId = 'design' | 'fitout' | 'approvals' | 'finance' | 'logistics'
export type EmailProviderId =
  | 'domain'
  | 'google'
  | 'hostinger'
  | 'zoho'
  | 'outlook'
  | 'godaddy'
  | 'custom'

export type EmailRoute = {
  id: EmailRouteId
  label: string
  email: string
  purpose: string
  categories: string[]
}

export type EmailRouteSettings = {
  enabled: boolean
  smtpProvider: EmailProviderId
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
  fromName: string
}

export type EmailRouteConfig = EmailRoute & EmailRouteSettings

export const EMAIL_ROUTES_STORAGE_KEY = 'abkreative_email_routes_v1'
export const EMAIL_ROUTE_SETTINGS_STORAGE_KEY = 'abkreative_email_route_settings_v1'

export const EMAIL_PROVIDER_PRESETS: Array<{
  id: EmailProviderId
  label: string
  host: string
  port: string
}> = [
  { id: 'domain', label: 'Domain Mail', host: 'mail.abkreative.com', port: '465' },
  { id: 'google', label: 'Google Workspace', host: 'smtp.gmail.com', port: '587' },
  { id: 'hostinger', label: 'Hostinger', host: 'smtp.hostinger.com', port: '465' },
  { id: 'zoho', label: 'Zoho Mail', host: 'smtp.zoho.com', port: '465' },
  { id: 'outlook', label: 'Outlook / Microsoft 365', host: 'smtp.office365.com', port: '587' },
  { id: 'godaddy', label: 'GoDaddy', host: 'smtpout.secureserver.net', port: '465' },
  { id: 'custom', label: 'Custom SMTP', host: '', port: '587' },
]

export const DEFAULT_EMAIL_ROUTES: EmailRoute[] = [
  {
    id: 'design',
    label: 'Design',
    email: 'design@abkreative.com',
    purpose: 'Design, 3D, software, advertising, and dropshipping product pitches',
    categories: [
      'INTERIOR_DESIGN',
      'VISUALIZATION_3D',
      'DESIGN_SERVICES',
      'TECHNICAL_DESIGN',
      'SOFTWARE_DEV',
      'ADVERTISING',
      'VIRAL_PRODUCTS',
      'INVESTMENT',
      'REAL_ESTATE',
      'INVESTORS',
    ],
  },
  {
    id: 'fitout',
    label: 'Fitout',
    email: 'fitout@abkreative.com',
    purpose: 'Fitout and renovation pitches',
    categories: ['FITOUT'],
  },
  {
    id: 'approvals',
    label: 'UAE Approvals',
    email: 'uae.approvals@abkreative.com',
    purpose: 'Approvals, licenses, PRO, and business setup pitches',
    categories: ['UAE_APPROVALS', 'BUSINESS_SETUP'],
  },
  {
    id: 'finance',
    label: 'Cards & Loans',
    email: 'finance@abkreative.com',
    purpose: 'Credit card, personal loan, business loan, and finance pitches',
    categories: ['FINANCE'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    email: 'wajid@abkreative.com',
    purpose: 'Logistics, shipping, and freight pitches',
    categories: ['LOGISTICS'],
  },
]

export const CATEGORY_EMAIL_ROUTE: Record<string, EmailRouteId> = DEFAULT_EMAIL_ROUTES.reduce(
  (acc, route) => {
    for (const category of route.categories) {
      acc[category] = route.id
    }
    return acc
  },
  {} as Record<string, EmailRouteId>,
)

export function getDefaultRouteSettings(route: EmailRoute): EmailRouteSettings {
  const domainPreset = getEmailProviderPreset('domain')

  return {
    enabled: true,
    smtpProvider: domainPreset.id,
    smtpHost: domainPreset.host,
    smtpPort: domainPreset.port,
    smtpUser: route.email,
    smtpPass: '',
    fromName: route.id === 'logistics' ? 'Wajid' : 'Arshad',
  }
}

export function getEmailProviderPreset(providerId: EmailProviderId) {
  return EMAIL_PROVIDER_PRESETS.find((provider) => provider.id === providerId) || EMAIL_PROVIDER_PRESETS[0]
}

export function mergeEmailRoutes(overrides: Partial<EmailRoute>[]): EmailRoute[] {
  return DEFAULT_EMAIL_ROUTES.map((route) => {
    const override = overrides.find((item) => item.id === route.id)
    const migratedOverride =
      route.id === 'logistics' && override?.email === 'waji@abkreative.com'
        ? { ...override, email: route.email }
        : override

    return {
      ...route,
      ...migratedOverride,
      id: route.id,
      categories: route.categories,
    }
  })
}

export function mergeRouteSettings(
  routes: EmailRoute[],
  settings: Partial<Record<EmailRouteId, Partial<EmailRouteSettings>>>,
): EmailRouteConfig[] {
  return routes.map((route) => {
    const savedSettings = settings[route.id] || {}
    const migratedSettings =
      route.id === 'logistics'
        ? {
            ...savedSettings,
            smtpUser:
              !savedSettings.smtpUser || savedSettings.smtpUser === 'waji@abkreative.com'
                ? route.email
                : savedSettings.smtpUser,
            fromName:
              !savedSettings.fromName || savedSettings.fromName === 'Arshad'
                ? 'Wajid'
                : savedSettings.fromName,
          }
        : savedSettings
    const config = {
      ...route,
      ...getDefaultRouteSettings(route),
      ...migratedSettings,
    }

    if (!migratedSettings.smtpProvider && config.smtpHost === 'smtp.gmail.com') {
      const domainPreset = getEmailProviderPreset('domain')
      return {
        ...config,
        smtpProvider: domainPreset.id,
        smtpHost: domainPreset.host,
        smtpPort: domainPreset.port,
        smtpUser: route.email,
      }
    }

    return config
  })
}

export function getEmailRouteForCategory(
  category: string,
  routes: EmailRoute[] = DEFAULT_EMAIL_ROUTES,
): EmailRoute {
  const routeId = CATEGORY_EMAIL_ROUTE[category] || 'design'
  return routes.find((route) => route.id === routeId) || routes[0]
}
