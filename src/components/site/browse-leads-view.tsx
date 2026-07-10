'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Loader2,
  PenTool,
  Hammer,
  CreditCard,
  Truck,
  ShieldCheck,
  Building2,
  LayoutGrid,
  Home,
  Box,
  Ruler,
  Code,
  TrendingUp,
  Building,
  HandCoins,
  Megaphone,
  MailCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadCard } from './lead-card'
import { LeadDetailDialog } from './lead-detail-dialog'
import { toast } from '@/hooks/use-toast'
import {
  COUNTRIES,
  CATEGORIES,
  REGIONS,
  SUBCATEGORIES,
  getCategoryMeta,
  type Lead,
} from '@/lib/constants'
import { getPitchTemplate } from '@/lib/email-templates'
import { markLeadPitchSent } from '@/lib/pitch-status'
import {
  DEFAULT_EMAIL_ROUTES,
  EMAIL_ROUTES_STORAGE_KEY,
  EMAIL_ROUTE_SETTINGS_STORAGE_KEY,
  getEmailRouteForCategory,
  mergeEmailRoutes,
  mergeRouteSettings,
  type EmailRoute,
  type EmailRouteConfig,
  type EmailRouteId,
} from '@/lib/email-routing'
import { motion } from 'framer-motion'

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const AI_QUOTA_PAUSE_KEY = 'abkreative_ai_quota_pause_until_v1'
const AI_QUOTA_PAUSE_MS = 6 * 60 * 60 * 1000

const CATEGORY_ICONS: Record<string, typeof LayoutGrid> = {
  INTERIOR_DESIGN: Home,
  VISUALIZATION_3D: Box,
  DESIGN_SERVICES: PenTool,
  TECHNICAL_DESIGN: Ruler,
  SOFTWARE_DEV: Code,
  FITOUT: Hammer,
  FINANCE: CreditCard,
  LOGISTICS: Truck,
  UAE_APPROVALS: ShieldCheck,
  BUSINESS_SETUP: Building2,
  VIRAL_PRODUCTS: TrendingUp,
  INVESTMENT: TrendingUp,
  REAL_ESTATE: Building,
  INVESTORS: HandCoins,
  ADVERTISING: Megaphone,
  // Legacy backward-compat
  DESIGN: Home,
  CREDIT_CARD: CreditCard,
  DUBAI_BUSINESS_SETUP: Building2,
}

const DAILY_MAX_GENERATION_PLAN = [
  { category: 'DESIGN_SERVICES', count: 3 },
  { category: 'TECHNICAL_DESIGN', count: 2 },
  { category: 'VISUALIZATION_3D', count: 2 },
  { category: 'FITOUT', count: 2 },
]

type GeneratedPitchLead = Pick<
  Lead,
  | 'category'
  | 'id'
  | 'clientName'
  | 'clientCompany'
  | 'clientEmail'
  | 'title'
  | 'subcategory'
  | 'budgetMin'
  | 'budgetMax'
  | 'currency'
  | 'country'
  | 'city'
>

function loadEmailRoutes(): EmailRoute[] {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_ROUTES

  try {
    const raw = localStorage.getItem(EMAIL_ROUTES_STORAGE_KEY)
    return mergeEmailRoutes(raw ? JSON.parse(raw) : [])
  } catch {
    return DEFAULT_EMAIL_ROUTES
  }
}

function loadEmailConfigs(): EmailRouteConfig[] {
  const routes = loadEmailRoutes()
  if (typeof window === 'undefined') return mergeRouteSettings(routes, {})

  try {
    const raw = localStorage.getItem(EMAIL_ROUTE_SETTINGS_STORAGE_KEY)
    return mergeRouteSettings(routes, raw ? JSON.parse(raw) : {})
  } catch {
    return mergeRouteSettings(routes, {})
  }
}

function loadEmailConfigForLead(category: string): EmailRouteConfig {
  const configs = loadEmailConfigs()
  const route = getEmailRouteForCategory(category, configs)
  return configs.find((config) => config.id === route.id) || configs[0]
}

function canSendAutoPitch(config: EmailRouteConfig | undefined) {
  return Boolean(config?.enabled && config.smtpHost && config.smtpUser && config.smtpPass)
}

function loadAiQuotaPauseUntil() {
  if (typeof window === 'undefined') return 0

  const value = Number(localStorage.getItem(AI_QUOTA_PAUSE_KEY))
  return Number.isFinite(value) && value > Date.now() ? value : 0
}

function saveAiQuotaPause() {
  const pauseUntil = Date.now() + AI_QUOTA_PAUSE_MS
  localStorage.setItem(AI_QUOTA_PAUSE_KEY, String(pauseUntil))
  return pauseUntil
}

function clearAiQuotaPause() {
  localStorage.removeItem(AI_QUOTA_PAUSE_KEY)
}

function formatPauseTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function BrowseLeadsView() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('ALL')
  const [country, setCountry] = useState('ALL')
  const [category, setCategory] = useState('ALL')
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [sort, setSort] = useState('newest')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [todayOnly, setTodayOnly] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingLabel, setGeneratingLabel] = useState('')
  const [autoPitchEnabled, setAutoPitchEnabled] = useState(false)
  const [aiQuotaPauseUntil, setAiQuotaPauseUntil] = useState(0)
  const [serverConfiguredRoutes, setServerConfiguredRoutes] = useState<EmailRouteId[]>([])

  useEffect(() => {
    setAiQuotaPauseUntil(loadAiQuotaPauseUntil())
  }, [])

  useEffect(() => {
    fetch('/api/email-config-health')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.configuredRoutes)) {
          setServerConfiguredRoutes(data.configuredRoutes)
        }
      })
      .catch(() => setServerConfiguredRoutes([]))
  }, [])

  const qs = useMemo(() => {
    const params = new URLSearchParams()
    if (country !== 'ALL') params.set('country', country)
    if (region !== 'ALL') params.set('region', region)
    if (category !== 'ALL') params.set('category', category)
    if (subcategory) params.set('subcategory', subcategory)
    if (sort) params.set('sort', sort)
    if (minBudget) params.set('minBudget', minBudget)
    if (maxBudget) params.set('maxBudget', maxBudget)
    if (search) params.set('search', search)
    if (todayOnly) params.set('today', 'true')
    return params.toString()
  }, [country, region, category, subcategory, sort, minBudget, maxBudget, search, todayOnly])

  const { data, error, isLoading, mutate } = useSWR<{
    leads: Lead[]
    count: number
  }>(`/api/leads?${qs}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  })

  // Category counts from data or API
  const { data: analytics, mutate: mutateAnalytics } = useSWR<{
    leadsByCategory: Array<{ category: string; count: number }>
  }>('/api/analytics', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  const categoryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {}
    analytics?.leadsByCategory?.forEach((c) => {
      counts[c.category] = c.count
    })
    return counts
  }, [analytics])

  const hasActiveFilters =
    country !== 'ALL' ||
    region !== 'ALL' ||
    category !== 'ALL' ||
    subcategory !== null ||
    minBudget !== '' ||
    maxBudget !== '' ||
    search !== ''

  const resetFilters = useCallback(() => {
    setSearch('')
    setCountry('ALL')
    setRegion('ALL')
    setCategory('ALL')
    setSubcategory(null)
    setSort('newest')
    setMinBudget('')
    setMaxBudget('')
  }, [])

  const activeFilterCount =
    (country !== 'ALL' ? 1 : 0) +
    (region !== 'ALL' ? 1 : 0) +
    (category !== 'ALL' ? 1 : 0) +
    (subcategory !== null ? 1 : 0) +
    (minBudget !== '' ? 1 : 0) +
    (maxBudget !== '' ? 1 : 0)

  const handleCategoryClick = useCallback((code: string) => {
    if (category === code) {
      setCategory('ALL')
      setSubcategory(null)
    } else {
      setCategory(code)
      setSubcategory(null)
    }
  }, [category])

  const filteredCountries = useMemo(() => {
    if (region === 'ALL') return COUNTRIES
    return COUNTRIES.filter((c) => c.region === region)
  }, [region])

  const activeSubcategories = category !== 'ALL' ? SUBCATEGORIES[category] || [] : []
  const aiQuotaPaused = aiQuotaPauseUntil > Date.now()

  const sendFirstPitch = useCallback(async (lead: GeneratedPitchLead) => {
    if (!lead.clientEmail || !/\S+@\S+\.\S+/.test(lead.clientEmail)) {
      return { status: 'skipped' as const, error: 'Lead email missing' }
    }

    const emailConfig = loadEmailConfigForLead(lead.category)
    const hasBrowserSmtp = canSendAutoPitch(emailConfig)
    const hasServerSmtp = serverConfiguredRoutes.includes(emailConfig.id)
    if (!emailConfig.enabled || (!hasBrowserSmtp && !hasServerSmtp)) {
      return { status: 'skipped' as const, error: `${emailConfig.email} SMTP not configured` }
    }

    const template = getPitchTemplate(lead.category, {
      clientName: lead.clientName,
      title: lead.title,
      clientCompany: lead.clientCompany,
      subcategory: lead.subcategory,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      currency: lead.currency,
      country: lead.country,
      city: lead.city,
      senderName: emailConfig.fromName,
    })

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: lead.clientEmail,
        subject: template.subject,
        body: template.body,
        from: emailConfig.email,
        fromName: emailConfig.fromName,
        smtpHost: emailConfig.smtpHost,
        smtpPort: emailConfig.smtpPort,
        smtpUser: emailConfig.smtpUser,
        smtpPass: emailConfig.smtpPass,
        routeId: emailConfig.id,
        category: lead.category,
        leadId: lead.id,
        bcc: emailConfig.email,
        replyTo: emailConfig.email,
      }),
    })

    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.success) {
      return {
        status: 'failed' as const,
        error: result.error || 'Pitch email failed',
      }
    }

    return { status: 'sent' as const }
  }, [serverConfiguredRoutes])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, skill, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 border-border bg-[#111111] pl-9 pr-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`h-11 gap-2 border-border bg-[#111111] text-muted-foreground hover:text-foreground ${showAdvanced ? 'border-[#D9FA54]/40 text-[#D9FA54]' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 justify-center bg-[#D9FA54] text-[#0A0A0A] px-1.5 text-[10px] font-bold">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={todayOnly ? 'default' : 'outline'}
          onClick={() => setTodayOnly(!todayOnly)}
          className={`h-11 gap-2 ${todayOnly ? 'bg-amber-500 text-black hover:bg-amber-400' : 'border-border bg-[#111111] text-muted-foreground hover:text-foreground'}`}
        >
          📅 Today
        </Button>
        <div
          className={`flex h-11 items-center gap-2 rounded-md border px-3 text-xs font-medium ${
            autoPitchEnabled
              ? 'border-[#D9FA54]/40 bg-[#D9FA54]/10 text-[#D9FA54]'
              : 'border-border bg-[#111111] text-muted-foreground'
          }`}
        >
          <Switch
            checked={autoPitchEnabled}
            onCheckedChange={setAutoPitchEnabled}
            aria-label="Auto first pitch"
          />
          <MailCheck className="h-4 w-4" />
          <span className="whitespace-nowrap">Auto first pitch</span>
        </div>
        <Button
          variant="outline"
          disabled={generating}
          onClick={async () => {
            if (aiQuotaPaused) {
              toast({
                title: 'Free AI paused',
                description: `Use the saved leads now. Try generating again after ${formatPauseTime(aiQuotaPauseUntil)}.`,
              })
              return
            }

            setGenerating(true)
            try {
              const generationPlan =
                category === 'ALL'
                  ? DAILY_MAX_GENERATION_PLAN
                  : [{ category, count: 3 }]

              let savedCount = 0
              let failedCount = 0
              let generatedCount = 0
              let rejectedCount = 0
              let autoSentCount = 0
              let autoSkippedCount = 0
              let autoFailedCount = 0
              let autoPitchMessage = ''
              const failedCategories: string[] = []
              let quotaExhausted = false
              let quotaMessage = ''
              const generationWarnings: string[] = []

              for (const item of generationPlan) {
                setGeneratingLabel(getCategoryMeta(item.category).short)
                const res = await fetch('/api/generate-leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...item,
                    maxQueries: category === 'ALL' ? 1 : 2,
                  }),
                })
                const json = await res.json()

                if (!res.ok) {
                  if (json.code === 'AI_QUOTA_EXHAUSTED') {
                    quotaExhausted = true
                    const pauseUntil = saveAiQuotaPause()
                    setAiQuotaPauseUntil(pauseUntil)
                    quotaMessage =
                      json.error ||
                      `Free AI is paused until about ${formatPauseTime(pauseUntil)}. Work saved leads first.`
                    break
                  }

                  failedCategories.push(item.category)
                  continue
                }

                if (json.warning) generationWarnings.push(json.warning)
                generatedCount += json.leads?.length || 0
                rejectedCount += json.quality?.rejected || 0

                for (const lead of json.leads || []) {
                  const saveRes = await fetch('/api/save-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lead),
                  })

                  if (saveRes.ok) {
                    savedCount++
                    if (autoPitchEnabled) {
                      const pitchResult = await sendFirstPitch(lead as GeneratedPitchLead)
                      if (pitchResult.status === 'sent') {
                        autoSentCount++
                        markLeadPitchSent((lead as GeneratedPitchLead).id)
                      } else if (pitchResult.status === 'skipped') {
                        autoSkippedCount++
                        autoPitchMessage ||= pitchResult.error
                      } else {
                        autoFailedCount++
                        autoPitchMessage ||= pitchResult.error
                      }
                    }
                  } else {
                    failedCount++
                  }
                }
              }

              if (savedCount > 0) {
                mutate()
                mutateAnalytics()
                const autoPitchSummary = autoPitchEnabled
                  ? ` Auto pitch: ${autoSentCount} sent${autoSkippedCount ? `, ${autoSkippedCount} skipped` : ''}${autoFailedCount ? `, ${autoFailedCount} failed` : ''}${autoPitchMessage ? ` (${autoPitchMessage})` : ''}.`
                  : ''
                const warningSummary =
                  generationWarnings.length > 0 ? ` ${generationWarnings[0]}` : ''
                toast({
                  title: `${savedCount} verified lead${savedCount === 1 ? '' : 's'} saved`,
                  description:
                    (category === 'ALL'
                      ? `Free safe batch ran design and fitout priority categories. Rejected ${rejectedCount} unverified result${rejectedCount === 1 ? '' : 's'}.`
                      : failedCount > 0
                        ? `${failedCount} generated lead${failedCount === 1 ? '' : 's'} could not be saved.`
                        : `Rejected ${rejectedCount} unverified result${rejectedCount === 1 ? '' : 's'}.`) +
                    warningSummary +
                    autoPitchSummary,
                })
              } else if (generatedCount > 0) {
                toast({
                  title: 'Leads were found but not saved',
                  description:
                    'Check your database settings and run the database setup before generating again.',
                  variant: 'destructive',
                })
              } else {
                toast({
                  title: quotaExhausted ? 'Free AI limit reached' : 'No verified leads found',
                  description:
                    quotaExhausted
                      ? quotaMessage
                      : failedCategories.length > 0
                      ? `Generation failed for ${failedCategories.join(', ')}. Try one category at a time.`
                      : `Rejected ${rejectedCount} result${rejectedCount === 1 ? '' : 's'} without real contact evidence.`,
                  variant: quotaExhausted ? 'destructive' : undefined,
                })
              }
            } catch (e) {
              console.error('Generate leads error:', e)
              toast({
                title: 'AI generation failed',
                description: e instanceof Error ? e.message : 'Please try again.',
                variant: 'destructive',
              })
            } finally {
              setGenerating(false)
              setGeneratingLabel('')
            }
          }}
          className="h-11 gap-2 border-border bg-[#111111] text-[#D9FA54] hover:bg-[#D9FA54]/10 hover:text-[#D9FA54] disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base">⚡</span>}
          {generating
            ? generatingLabel
              ? `Generating ${generatingLabel}...`
              : 'Generating...'
            : aiQuotaPaused
              ? 'Free AI paused'
            : category === 'ALL'
              ? 'Free Safe Verified'
              : 'Generate 3 Verified'}
        </Button>
        {aiQuotaPaused && (
          <Button
            variant="ghost"
            className="h-11 gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearAiQuotaPause()
              setAiQuotaPauseUntil(0)
              toast({
                title: 'AI pause cleared',
                description: 'You can try a small verified batch again.',
              })
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Clear AI pause
          </Button>
        )}
      </div>

      {/* Category pills */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setCategory('ALL')
            setSubcategory(null)
          }}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            category === 'ALL'
              ? 'border-[#D9FA54] bg-[#D9FA54]/10 text-[#D9FA54]'
              : 'border-border bg-[#111111] text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          All
        </button>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.code] || LayoutGrid
          const isActive = category === c.code
          return (
            <button
              key={c.code}
              onClick={() => handleCategoryClick(c.code)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-[#D9FA54] bg-[#D9FA54]/10 text-[#D9FA54]'
                  : 'border-border bg-[#111111] text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.short}
              {categoryCounts[c.code] !== undefined && (
                <span className="ml-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px]">
                  {categoryCounts[c.code]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Subcategory pills */}
      {activeSubcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex flex-wrap items-center gap-1.5"
        >
          {activeSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() =>
                setSubcategory(subcategory === sub ? null : sub)
              }
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                subcategory === sub
                  ? 'border-[#D9FA54]/40 bg-[#D9FA54]/10 text-[#D9FA54]'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {sub}
            </button>
          ))}
        </motion.div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-border bg-[#111111] p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Region
            </label>
            <Select value={region} onValueChange={(v) => { setRegion(v); setCountry('ALL') }}>
              <SelectTrigger className="h-9 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Country
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {filteredCountries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Sort by
            </label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="budget_high">Budget (high to low)</SelectItem>
                <SelectItem value="budget_low">Budget (low to high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Min budget (USD)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="h-9 border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Max budget (USD)
            </label>
            <Input
              type="number"
              placeholder="50000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="h-9 border-border bg-background text-foreground"
            />
          </div>
          {hasActiveFilters && (
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset all filters
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Results header */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading leads...
            </span>
          ) : error ? (
            <span className="text-red-400">Failed to load leads</span>
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {data?.count ?? 0}
              </span>{' '}
              {data?.count === 1 ? 'lead' : 'leads'} found
              {hasActiveFilters && ' (filtered)'}
            </>
          )}
        </h2>
        {!isLoading && data && data.count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutate()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Refresh
          </Button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl bg-[#111111]" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm text-red-400">
            Could not load leads. Please try again.
          </p>
          <Button
            onClick={() => mutate()}
            variant="outline"
            size="sm"
            className="mt-3 border-border text-muted-foreground hover:text-foreground"
          >
            Retry
          </Button>
        </div>
      ) : data && data.leads.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.leads.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={i}
              onClick={() => setSelectedLeadId(lead.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-[#111111] p-12 text-center">
          <p className="text-sm font-medium text-foreground">No leads match your filters</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try widening your search or resetting filters.
          </p>
          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="mt-4 border-border text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </Button>
          )}
        </div>
      )}

      {/* Detail dialog */}
      {selectedLeadId && (
        <LeadDetailDialog
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  )
}
