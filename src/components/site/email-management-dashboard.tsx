'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, Mail, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getCategoryMeta } from '@/lib/constants'
import {
  DEFAULT_EMAIL_ROUTES,
  EMAIL_ROUTES_STORAGE_KEY,
  EMAIL_ROUTE_SETTINGS_STORAGE_KEY,
  type EmailRoute,
  type EmailRouteConfig,
  type EmailRouteId,
  type EmailRouteSettings,
  mergeEmailRoutes,
  mergeRouteSettings,
} from '@/lib/email-routing'

function loadRoutes(): EmailRoute[] {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_ROUTES

  try {
    const raw = localStorage.getItem(EMAIL_ROUTES_STORAGE_KEY)
    return mergeEmailRoutes(raw ? JSON.parse(raw) : [])
  } catch {
    return DEFAULT_EMAIL_ROUTES
  }
}

function loadRouteSettings(routes: EmailRoute[]): EmailRouteConfig[] {
  if (typeof window === 'undefined') return mergeRouteSettings(routes, {})

  try {
    const raw = localStorage.getItem(EMAIL_ROUTE_SETTINGS_STORAGE_KEY)
    return mergeRouteSettings(routes, raw ? JSON.parse(raw) : {})
  } catch {
    return mergeRouteSettings(routes, {})
  }
}

function saveConfigs(configs: EmailRouteConfig[]) {
  const routeOverrides = configs.map(({ id, email }) => ({ id, email }))
  const settings = configs.reduce(
    (acc, config) => {
      acc[config.id] = {
        enabled: config.enabled,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass,
        fromName: config.fromName,
      }
      return acc
    },
    {} as Record<EmailRouteId, EmailRouteSettings>,
  )

  localStorage.setItem(EMAIL_ROUTES_STORAGE_KEY, JSON.stringify(routeOverrides))
  localStorage.setItem(EMAIL_ROUTE_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function EmailManagementDashboard() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<EmailRouteConfig[]>(() =>
    mergeRouteSettings(DEFAULT_EMAIL_ROUTES, {}),
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const routes = loadRoutes()
      setConfigs(loadRouteSettings(routes))
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  const configuredCount = useMemo(
    () => configs.filter((config) => config.enabled && config.smtpUser && config.smtpPass).length,
    [configs],
  )

  const categoryCount = useMemo(
    () => configs.reduce((total, config) => total + config.categories.length, 0),
    [configs],
  )

  function updateConfig(id: EmailRouteId, patch: Partial<EmailRouteConfig>) {
    setConfigs((current) =>
      current.map((config) => (config.id === id ? { ...config, ...patch } : config)),
    )
  }

  function handleSave() {
    saveConfigs(configs)
    toast({
      title: 'Email routing saved',
      description: 'Pitch emails will use the selected sender for each category.',
    })
  }

  function handleReset() {
    localStorage.removeItem(EMAIL_ROUTES_STORAGE_KEY)
    localStorage.removeItem(EMAIL_ROUTE_SETTINGS_STORAGE_KEY)
    const routes = DEFAULT_EMAIL_ROUTES
    setConfigs(loadRouteSettings(routes))
    toast({
      title: 'Email routing reset',
      description: 'Default AB Kreative sender emails restored.',
    })
  }

  async function handleCopy(email: string) {
    await navigator.clipboard.writeText(email)
    toast({ title: 'Email copied', description: email })
  }

  return (
    <section id="email-management" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#111111] px-3 py-1 text-xs font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Email Management
            </div>
            <h2
              className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Category Sender Dashboard
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 border-border">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
            >
              <Save className="h-4 w-4" />
              Save Routing
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-[#111111] p-4">
            <div className="text-xs text-muted-foreground">Sender accounts</div>
            <div className="mt-2 text-2xl font-bold">{configs.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-[#111111] p-4">
            <div className="text-xs text-muted-foreground">SMTP ready</div>
            <div className="mt-2 text-2xl font-bold">{configuredCount}/{configs.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-[#111111] p-4">
            <div className="text-xs text-muted-foreground">Mapped categories</div>
            <div className="mt-2 text-2xl font-bold">{categoryCount}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {configs.map((config) => {
            const isReady = Boolean(config.enabled && config.smtpUser && config.smtpPass)

            return (
              <div key={config.id} className="rounded-lg border border-border bg-[#111111] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-base font-semibold text-foreground"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {config.label}
                      </h3>
                      {isReady ? (
                        <Badge className="border-green-500/30 bg-green-500/10 text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                          Setup
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{config.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) => updateConfig(config.id, { enabled })}
                      aria-label={`${config.label} sender enabled`}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Sender Email</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={config.email}
                        onChange={(event) =>
                          updateConfig(config.id, {
                            email: event.target.value,
                            smtpUser:
                              config.smtpUser === config.email ? event.target.value : config.smtpUser,
                          })
                        }
                        className="border-border bg-[#0A0A0A] text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(config.email)}
                        className="shrink-0 border-border"
                        aria-label={`Copy ${config.email}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">From Name</Label>
                    <Input
                      value={config.fromName}
                      onChange={(event) => updateConfig(config.id, { fromName: event.target.value })}
                      className="border-border bg-[#0A0A0A] text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">SMTP Host</Label>
                    <Input
                      value={config.smtpHost}
                      onChange={(event) => updateConfig(config.id, { smtpHost: event.target.value })}
                      className="border-border bg-[#0A0A0A] text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">SMTP Port</Label>
                    <Input
                      value={config.smtpPort}
                      onChange={(event) => updateConfig(config.id, { smtpPort: event.target.value })}
                      className="border-border bg-[#0A0A0A] text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">SMTP Username</Label>
                    <Input
                      type="email"
                      value={config.smtpUser}
                      onChange={(event) => updateConfig(config.id, { smtpUser: event.target.value })}
                      className="border-border bg-[#0A0A0A] text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">App Password</Label>
                    <Input
                      type="password"
                      value={config.smtpPass}
                      onChange={(event) => updateConfig(config.id, { smtpPass: event.target.value })}
                      className="border-border bg-[#0A0A0A] text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {config.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="border-border bg-[#0A0A0A] text-muted-foreground"
                    >
                      {getCategoryMeta(category).short}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#D9FA54]/15 bg-[#D9FA54]/5 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#D9FA54]" />
          <span>SMTP passwords stay in this browser only and are not committed to the project.</span>
        </div>
      </div>
    </section>
  )
}
