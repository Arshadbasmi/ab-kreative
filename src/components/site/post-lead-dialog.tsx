'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, Send, Globe, Linkedin, MapPin } from 'lucide-react'
import {
  COUNTRIES,
  CATEGORIES,
  SUBCATEGORIES,
  PROJECT_TYPES,
  EXPERIENCE_LEVELS,
  TIMELINES,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  getCountryRegion,
} from '@/lib/constants'

export function PostLeadDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean
  onClose: () => void
  onSubmitted?: () => void
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'INTERIOR_DESIGN',
    subcategory: '',
    country: 'AE',
    city: '',
    region: 'GCC',
    budgetMin: '',
    budgetMax: '',
    timeline: '4-6 weeks',
    skills: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientLinkedin: '',
    clientWebsite: '',
    sourceUrl: '',
    experienceReq: 'Mid-level',
    projectType: 'One-off',
    urgent: false,
    source: 'direct',
  })

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSubmitted(false)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  const update = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleCountryChange = (code: string) => {
    const region = getCountryRegion(code) || 'ALL'
    setForm((f) => ({ ...f, country: code, region }))
  }

  const handleCategoryChange = (code: string) => {
    setForm((f) => ({ ...f, category: code, subcategory: '' }))
  }

  const availableSubcategories = useMemo(
    () => SUBCATEGORIES[form.category] || [],
    [form.category]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
      toast({
        title: 'Lead published',
        description: 'Your lead is now live and visible to service providers.',
      })
      onSubmitted?.()
    } catch {
      toast({
        title: 'Submission failed',
        description: 'Please complete all required fields and try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setForm({
      title: '',
      description: '',
      category: 'INTERIOR_DESIGN',
      subcategory: '',
      country: 'AE',
      city: '',
      region: 'GCC',
      budgetMin: '',
      budgetMax: '',
      timeline: '4-6 weeks',
      skills: '',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientLinkedin: '',
      clientWebsite: '',
      sourceUrl: '',
      experienceReq: 'Mid-level',
      projectType: 'One-off',
      urgent: false,
      source: 'direct',
    })
    setSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-2xl overflow-hidden border-border bg-[#0A0A0A] p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Post a new lead
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit a lead across any of our five verticals. Worldwide coverage.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9FA54]/10">
              <CheckCircle2 className="h-7 w-7 text-[#D9FA54]" />
            </div>
            <h3
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Lead published successfully
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Your lead is now visible to service providers across the platform.
              Expect responses within hours.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Post another
              </Button>
              <Button
                size="sm"
                onClick={onClose}
                className="bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[80vh] flex-col overflow-y-auto scrollbar-premium"
          >
            <div className="space-y-5 px-6 py-5">
              {/* Section 1: Lead details */}
              <section className="space-y-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Lead details
                </h3>
                <div>
                  <Label htmlFor="title" className="text-xs text-muted-foreground">
                    Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    required
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                    placeholder="e.g. Luxury hotel interior fitout"
                  />
                </div>
                <div>
                  <Label htmlFor="desc" className="text-xs text-muted-foreground">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="desc"
                    required
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className="mt-1 min-h-[100px] resize-none border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                    placeholder="Describe the project scope, deliverables, and any reference materials..."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Category <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Subcategory
                    </Label>
                    <Select
                      value={form.subcategory}
                      onValueChange={(v) => update('subcategory', v)}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="skills" className="text-xs text-muted-foreground">
                    Required skills <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="skills"
                    required
                    value={form.skills}
                    onChange={(e) => update('skills', e.target.value)}
                    className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                    placeholder="Comma-separated, e.g. AutoCAD, Revit, Project Management"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Separate each skill with a comma
                  </p>
                </div>
              </section>

              {/* Section 2: Location */}
              <section className="space-y-3 border-t border-border pt-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Location
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Country <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={form.country}
                      onValueChange={handleCountryChange}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs text-muted-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="e.g. Dubai"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Full Address</span>
                  </Label>
                  <Input
                    id="address"
                    value={form.clientAddress}
                    onChange={(e) => update('clientAddress', e.target.value)}
                    className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                    placeholder="e.g. Office 405, Business Bay, Dubai, UAE"
                  />
                </div>
              </section>

              {/* Section 3: Budget & timeline */}
              <section className="space-y-3 border-t border-border pt-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Budget & timeline
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="bmin" className="text-xs text-muted-foreground">
                      Min budget (USD) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="bmin"
                      type="number"
                      required
                      value={form.budgetMin}
                      onChange={(e) => update('budgetMin', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bmax" className="text-xs text-muted-foreground">
                      Max budget (USD) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="bmax"
                      type="number"
                      required
                      value={form.budgetMax}
                      onChange={(e) => update('budgetMax', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Timeline <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={form.timeline}
                      onValueChange={(v) => update('timeline', v)}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMELINES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Project type
                    </Label>
                    <Select
                      value={form.projectType}
                      onValueChange={(v) => update('projectType', v)}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Experience level
                  </Label>
                  <Select
                    value={form.experienceReq}
                    onValueChange={(v) => update('experienceReq', v)}
                  >
                    <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-[#111111] px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-foreground">Mark as urgent</div>
                    <div className="text-[11px] text-muted-foreground">
                      Urgent leads receive higher visibility
                    </div>
                  </div>
                  <Switch
                    checked={form.urgent}
                    onCheckedChange={(v) => update('urgent', v)}
                  />
                </div>
              </section>

              {/* Section 4: Contact info */}
              <section className="space-y-3 border-t border-border pt-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Contact information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cn" className="text-xs text-muted-foreground">
                      Full name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="cn"
                      required
                      value={form.clientName}
                      onChange={(e) => update('clientName', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cc" className="text-xs text-muted-foreground">
                      Company
                    </Label>
                    <Input
                      id="cc"
                      value={form.clientCompany}
                      onChange={(e) => update('clientCompany', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ce" className="text-xs text-muted-foreground">
                      Email <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="ce"
                      type="email"
                      required
                      value={form.clientEmail}
                      onChange={(e) => update('clientEmail', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cp" className="text-xs text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      id="cp"
                      value={form.clientPhone}
                      onChange={(e) => update('clientPhone', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cl" className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn Profile</span>
                    </Label>
                    <Input
                      id="cl"
                      value={form.clientLinkedin}
                      onChange={(e) => update('clientLinkedin', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cw" className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> Website</span>
                    </Label>
                    <Input
                      id="cw"
                      value={form.clientWebsite}
                      onChange={(e) => update('clientWebsite', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5: Lead source */}
              <section className="space-y-3 border-t border-border pt-5">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Lead source
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Where did you find this lead?
                    </Label>
                    <Select
                      value={form.source}
                      onValueChange={(v) => update('source', v)}
                    >
                      <SelectTrigger className="mt-1 border-border bg-[#111111] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {LEAD_SOURCE_LABELS[s] || s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="su" className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> Source URL</span>
                    </Label>
                    <Input
                      id="su"
                      value={form.sourceUrl}
                      onChange={(e) => update('sourceUrl', e.target.value)}
                      className="mt-1 border-border bg-[#111111] text-foreground placeholder:text-muted-foreground focus-visible:ring-[#D9FA54]/30"
                      placeholder="https://linkedin.com/jobs/view/..."
                    />
                  </div>
                </div>
              </section>

              {/* Preview chips */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#111111] px-3 py-2 text-[11px] text-muted-foreground">
                <span>Preview:</span>
                <Badge
                  variant="outline"
                  className="border-border text-[10px] text-foreground"
                >
                  {CATEGORIES.find((c) => c.code === form.category)?.name}
                </Badge>
                {form.subcategory && (
                  <Badge
                    variant="outline"
                    className="border-border text-[10px] text-foreground"
                  >
                    {form.subcategory}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-border text-[10px] text-foreground"
                >
                  {COUNTRIES.find((c) => c.code === form.country)?.flag}{' '}
                  {COUNTRIES.find((c) => c.code === form.country)?.name}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-border text-[10px] text-foreground"
                >
                  {LEAD_SOURCE_LABELS[form.source] || form.source}
                </Badge>
                {form.urgent && (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 text-[10px] text-red-400"
                  >
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-[#0A0A0A]/95 px-6 py-3 backdrop-blur">
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                By posting, you agree to AB Kreative&apos;s terms of service.
              </p>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-border text-muted-foreground hover:text-foreground sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gap-2 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90 sm:flex-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish lead
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}