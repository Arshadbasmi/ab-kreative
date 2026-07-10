// Shared constants and types for AB Kreative lead generation platform

// ============ CATEGORIES ============
export const CATEGORIES = [
  { code: 'INTERIOR_DESIGN', name: 'Interior Design', short: 'Interior Design', icon: 'Home', color: 'rose' },
  { code: 'VISUALIZATION_3D', name: '3D Visualization', short: '3D Viz', icon: 'Box', color: 'violet' },
  { code: 'DESIGN_SERVICES', name: 'Design Services', short: 'Design', icon: 'PenTool', color: 'pink' },
  { code: 'TECHNICAL_DESIGN', name: 'Technical Design', short: 'Technical', icon: 'Ruler', color: 'fuchsia' },
  { code: 'SOFTWARE_DEV', name: 'App & Software', short: 'Software', icon: 'Code', color: 'indigo' },
  { code: 'FITOUT', name: 'Interior Fit-Out', short: 'Fitout', icon: 'Hammer', color: 'orange' },
  { code: 'FINANCE', name: 'Credit Cards & Loans', short: 'Cards/Loans', icon: 'CreditCard', color: 'magenta' },
  { code: 'LOGISTICS', name: 'Logistics', short: 'Logistics', icon: 'Truck', color: 'cyan' },
  { code: 'UAE_APPROVALS', name: 'Dubai Approvals', short: 'Approvals', icon: 'ShieldCheck', color: 'amber' },
  { code: 'BUSINESS_SETUP', name: 'Business Setup', short: 'Setup', icon: 'Building2', color: 'emerald' },
  { code: 'VIRAL_PRODUCTS', name: 'Dropshipping Products', short: 'Dropshipping', icon: 'TrendingUp', color: 'red' },
  { code: 'INVESTMENT', name: 'Investment', short: 'Investment', icon: 'TrendingUp', color: 'yellow' },
  { code: 'REAL_ESTATE', name: 'Real Estate', short: 'Real Estate', icon: 'Building', color: 'sky' },
  { code: 'INVESTORS', name: 'Investors', short: 'Investors', icon: 'HandCoins', color: 'lime' },
  { code: 'ADVERTISING', name: 'Advertising & Printing', short: 'Advertising', icon: 'Megaphone', color: 'teal' },
] as const

// ============ REGIONS ============
export const REGIONS = [
  { code: 'ALL', name: 'All Regions' },
  { code: 'GCC', name: 'GCC' },
  { code: 'MENA', name: 'MENA' },
  { code: 'Europe', name: 'Europe' },
  { code: 'North America', name: 'North America' },
  { code: 'Asia Pacific', name: 'Asia Pacific' },
  { code: 'South Asia', name: 'South Asia' },
  { code: 'Africa', name: 'Africa' },
  { code: 'Latin America', name: 'Latin America' },
  { code: 'Oceania', name: 'Oceania' },
] as const

// ============ COUNTRIES ============
export const COUNTRIES = [
  // GCC
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'GCC' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'GCC' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'GCC' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', region: 'GCC' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', region: 'GCC' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'GCC' },
  // MENA
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'MENA' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'MENA' },
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  // North America
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  // Asia Pacific
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia Pacific' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia Pacific' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia Pacific' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia Pacific' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia Pacific' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia Pacific' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia Pacific' },
  // South Asia
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'South Asia' },
  // Oceania
  // (Australia already listed above, NZ could be added)
] as const

// ============ SUBCATEGORIES ============
export const SUBCATEGORIES: Record<string, string[]> = {
  INTERIOR_DESIGN: ['Residential Design', 'Villa Design', 'Apartment Design', 'Office Design', 'Restaurant Design', 'Retail Design', 'Clinic Design', 'Hotel Design', 'Spa & Salon Design', 'Showroom Design'],
  VISUALIZATION_3D: ['3D Rendering', 'CGI', 'Architectural Visualization', 'Walkthrough Animation', 'AI Visualization', 'Exterior Rendering', 'Interior Rendering', 'Virtual Reality Tours'],
  DESIGN_SERVICES: ['Website Design', 'UI/UX', 'Landing Pages', 'Branding', 'Logo Design', 'Packaging', 'Brochure Design', 'Company Profile', 'Presentation Design', 'Pitch Deck', 'Social Media Design', 'Poster Design', 'Marketing Design'],
  TECHNICAL_DESIGN: ['Shop Drawings', 'Detail Drawings', 'Authority Drawings', 'CAD Drafting', 'BIM', 'Revit', 'Joinery Drawings', 'As-built Drawings', 'MEP Coordination'],
  SOFTWARE_DEV: ['Mobile Apps', 'SaaS', 'ERP', 'CRM', 'AI Chatbots', 'AI Automation', 'Business Software', 'Website Development', 'Dashboard Development', 'E-commerce Development'],
  FITOUT: ['Shops', 'Restaurants', 'Cafes', 'Clinics', 'Offices', 'Warehouses', 'Gyms', 'Hotels', 'Salons', 'Villas', 'Apartments', 'MEP Works', 'Joinery & Carpentry', 'Lighting', 'Furniture Procurement', 'Turnkey Projects', 'Exhibition Stands', 'Event Production', 'Signage & Printing', 'Facility Management', 'Marble & Stone', 'HVAC', 'Healthcare Fit-out', 'School & Nursery Fit-out', 'Warehouse & Industrial'],
  FINANCE: ['Credit Card Wanted', 'Personal Loan Wanted', 'Business Loan Wanted', 'Auto Loan Wanted', 'Home Loan / Mortgage', 'Debt Consolidation', 'Loan Buyout', 'Balance Transfer', 'Salary Transfer Lead', 'SME Finance', 'Islamic Finance', 'Insurance Lead'],
  LOGISTICS: ['Air Cargo', 'Sea Freight', 'Land Transport', 'Customs Clearance', 'Warehousing', 'Last Mile Delivery', 'Freight Forwarding', 'Cargo Handling', 'Cold Chain', 'E-commerce Fulfillment'],
  UAE_APPROVALS: ['Dubai Municipality', 'DCD', 'DEWA', 'RTA', 'Trakhees', 'DDA', 'Civil Defence', 'Building Permit', 'Completion Certificate', 'NOC', 'Signboard Approval', 'Fit-out Approval', 'DTCM', 'ESTIDAMA', 'ADCD'],
  BUSINESS_SETUP: ['Mainland Company', 'Free Zone', 'Offshore', 'Investor Visa', 'Employment Visa', 'Golden Visa', 'PRO Services', 'Accounting', 'VAT Registration', 'Corporate Tax', 'Banking Assistance', 'Trade License Renewal', 'Virtual Office', 'Franchise Expansion'],
  VIRAL_PRODUCTS: ['Beauty & Skincare Winners', 'Perfume & Fragrance', 'Health Supplements', 'Car Accessories', 'Phone Accessories & Gadgets', 'Kitchen Gadgets', 'Home Organization', 'Bedding & Home Comfort', 'Activewear & Basics', 'Baby & Kids Products', 'Pet Care Products', 'Arts & Craft Kits', 'Travel Accessories', 'Noon / Amazon UAE Winners', 'TikTok Shop Winners', 'High-Margin Low-Weight Products', 'Dropshipping Suppliers'],
  INVESTMENT: ['Online Businesses', 'AI Businesses', 'SaaS Opportunities', 'Franchises', 'Passive Income', 'Subscription Businesses', 'Startup Funding', 'Strategic Partnerships'],
  REAL_ESTATE: ['Villa Buyers', 'Apartment Buyers', 'Commercial Buyers', 'Land Buyers', 'Investor Inquiries', 'Property Management', 'Mega Projects'],
  INVESTORS: ['Family Offices', 'Angel Investors', 'Venture Capital', 'Private Investors', 'Business Buyers', 'Joint Venture Partners'],
  ADVERTISING: ['Business Cards', 'Flyers & Brochures', 'Roll-up Banners', 'Posters', 'Billboards', 'Vehicle Branding', 'Shop Signboards', '3D Letter Signage', 'LED Signage', 'Neon Signage', 'Corporate Uniforms', 'Corporate Gifts', 'Branded Merchandise', 'Social Media Creatives', 'Google Ad Creatives', 'Event Branding', 'Exhibition Branding', 'Large Format Printing', 'UV Printing', 'Acrylic Printing', 'Packaging & Labels'],
}

// ============ OTHER CONSTANTS ============
export const PROJECT_TYPES = ['One-off', 'Ongoing', 'Contract', 'Retainer'] as const
export const EXPERIENCE_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Expert'] as const
export const TIMELINES = [
  '1-2 weeks',
  '2-4 weeks',
  '4-6 weeks',
  '6-8 weeks',
  '8-12 weeks',
  '12+ weeks',
  'Monthly retainer',
] as const

export const LEAD_SOURCES = ['direct', 'website_scraped', 'referral', 'linkedin', 'freelance_platform', 'government_portal', 'trade_show', 'social_media', 'facebook_group', 'google_ads', 'whatsapp_group'] as const

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct submission',
  website_scraped: 'Website sourced',
  referral: 'Referral',
  linkedin: 'LinkedIn',
  freelance_platform: 'Freelance platform',
  government_portal: 'Government portal',
  trade_show: 'Trade show / Event',
  social_media: 'Social Media (Reels/TikTok)',
  facebook_group: 'Facebook Group',
  google_ads: 'Google Ads Click',
  whatsapp_group: 'WhatsApp Group',
}

// ============ TYPES ============
export type Lead = {
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
  pitchStatus?: string
  pitchSentAt?: string | null
  pitchLastError?: string | null
  pitchAttempts?: number
  urgent: boolean
  featured: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export type Analytics = {
  totals: {
    totalLeads: number
    urgentLeads: number
    featuredLeads: number
    totalPipelineValue: number
    avgBudget: number
    maxBudget: number
    minBudget: number
  }
  leadsByCategory: Array<{
    category: string
    name: string
    count: number
    avgBudget: number
  }>
  leadsByCountry: Array<{ country: string; name: string; count: number }>
  leadsByRegion: Array<{ region: string; name: string; count: number }>
  leadsBySubcategory: Array<{ subcategory: string; category: string; count: number }>
  trendingLeads: Array<{
    id: string
    title: string
    country: string
    category: string
    budgetMax: number
    views: number
  }>
}

// ============ HELPER FUNCTIONS ============

export function getCountryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name || code
}

export function getCountryFlag(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.flag || '🌐'
}

export function getRegionName(code: string | null | undefined): string {
  if (!code || code === 'ALL') return 'All Regions'
  return REGIONS.find((r) => r.code === code)?.name || code
}

// Backward compatibility: map old category codes to new ones
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  DESIGN: 'INTERIOR_DESIGN',
  CREDIT_CARD: 'FINANCE',
  DUBAI_BUSINESS_SETUP: 'BUSINESS_SETUP',
}

export function getCategoryMeta(code: string) {
  const resolved = LEGACY_CATEGORY_MAP[code] || code
  return CATEGORIES.find((c) => c.code === resolved) || CATEGORIES[0]
}

export const getTotalCategories = () => CATEGORIES.length

export function getSubcategories(category: string): string[] {
  return SUBCATEGORIES[category] || []
}

export function getCountryRegion(code: string): string | undefined {
  return COUNTRIES.find((c) => c.code === code)?.region
}

export function formatBudget(min: number, max: number, currency = 'USD'): string {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
    return `$${n}`
  }
  return `${fmt(min)} – ${fmt(max)}`
}

export function formatBudgetShort(max: number): string {
  if (max >= 1000) return `$${(max / 1000).toFixed(max % 1000 === 0 ? 0 : 1)}K`
  return `$${max}`
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
