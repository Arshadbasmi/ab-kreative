export type EmailRouteId = 'design' | 'fitout' | 'approvals' | 'finance' | 'logistics'

export type EmailRoute = {
  id: EmailRouteId
  label: string
  email: string
  purpose: string
  categories: string[]
}

export type EmailRouteSettings = {
  enabled: boolean
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
  fromName: string
}

export type EmailRouteConfig = EmailRoute & EmailRouteSettings

export const EMAIL_ROUTES_STORAGE_KEY = 'abkreative_email_routes_v1'
export const EMAIL_ROUTE_SETTINGS_STORAGE_KEY = 'abkreative_email_route_settings_v1'

export const DEFAULT_EMAIL_ROUTES: EmailRoute[] = [
  {
    id: 'design',
    label: 'Design',
    email: 'design@abkreative.com',
    purpose: 'Design, 3D, technical design, software, and advertising pitches',
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
    label: 'Finance',
    email: 'finance@abkreative.com',
    purpose: 'Credit card and finance pitches',
    categories: ['FINANCE'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    email: 'waji@abkreative.com',
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
  return {
    enabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: route.email,
    smtpPass: '',
    fromName: 'AB Kreative',
  }
}

export function mergeEmailRoutes(overrides: Partial<EmailRoute>[]): EmailRoute[] {
  return DEFAULT_EMAIL_ROUTES.map((route) => {
    const override = overrides.find((item) => item.id === route.id)
    return {
      ...route,
      ...override,
      id: route.id,
      categories: route.categories,
    }
  })
}

export function mergeRouteSettings(
  routes: EmailRoute[],
  settings: Partial<Record<EmailRouteId, Partial<EmailRouteSettings>>>,
): EmailRouteConfig[] {
  return routes.map((route) => ({
    ...route,
    ...getDefaultRouteSettings(route),
    ...(settings[route.id] || {}),
  }))
}

export function getEmailRouteForCategory(
  category: string,
  routes: EmailRoute[] = DEFAULT_EMAIL_ROUTES,
): EmailRoute {
  const routeId = CATEGORY_EMAIL_ROUTE[category] || 'design'
  return routes.find((route) => route.id === routeId) || routes[0]
}
