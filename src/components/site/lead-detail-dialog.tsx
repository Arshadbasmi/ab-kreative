'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import useSWR from 'swr'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Flame,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Eye,
  Star,
  Flag,
  Calendar,
  User,
  Globe,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Send,
  FileText,
  ImageIcon,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  type Lead,
  formatBudget,
  timeAgo,
  getCategoryMeta,
  getCountryFlag,
  getCountryName,
  LEAD_SOURCE_LABELS,
} from '@/lib/constants'
import { EmailPitchDialog } from './email-pitch-dialog'
import { downloadLead } from '@/lib/download-lead'
import { isLeadPitchSent, subscribePitchSent } from '@/lib/pitch-status'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // New categories
  INTERIOR_DESIGN: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  VISUALIZATION_3D: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  DESIGN_SERVICES: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  TECHNICAL_DESIGN: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  SOFTWARE_DEV: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  FITOUT: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  FINANCE: { bg: 'bg-pink-600/15', text: 'text-pink-300', border: 'border-pink-600/30' },
  LOGISTICS: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  UAE_APPROVALS: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  BUSINESS_SETUP: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  VIRAL_PRODUCTS: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  INVESTMENT: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  REAL_ESTATE: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  INVESTORS: { bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30' },
  ADVERTISING: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  // Legacy backward-compat mappings
  DESIGN: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  CREDIT_CARD: { bg: 'bg-pink-600/15', text: 'text-pink-300', border: 'border-pink-600/30' },
  DUBAI_BUSINESS_SETUP: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
}

function getCatColorClass(category: string) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.DESIGN
}

function getDisplayClientName(name: string): string {
  const cleaned = name.trim()
  return /^not specified$/i.test(cleaned) ? 'Contact not listed' : cleaned
}

function getWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null

  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null

  return `https://wa.me/${digits}`
}

export function LeadDetailDialog({
  leadId,
  onClose,
}: {
  leadId: string
  onClose: () => void
}) {
  const { data, isLoading } = useSWR<{ lead: Lead }>(
    `/api/leads/${leadId}`,
    fetcher
  )
  const { toast } = useToast()
  const [sendingEmail, setSendingEmail] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [pitchOpen, setPitchOpen] = useState(false)
  const [downloading, setDownloading] = useState<'pdf' | 'jpeg' | null>(null)

  const handleDownload = async (format: 'pdf' | 'jpeg') => {
    if (!lead) return
    setDownloading(format)
    toast({ title: `Generating ${format.toUpperCase()}...` })
    try {
      await downloadLead(lead, format)
      toast({ title: `${format.toUpperCase()} downloaded!` })
    } catch {
      toast({ title: 'Download failed', description: 'Could not generate file.', variant: 'destructive' })
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const lead = data?.lead
  const cat = lead ? getCategoryMeta(lead.category) : null
  const catColor = lead ? getCatColorClass(lead.category) : null
  const pitchSent = useSyncExternalStore(
    subscribePitchSent,
    () => (lead?.id ? isLeadPitchSent(lead.id) : false),
    () => false,
  )

  const copyToClipboard = (text: string | null | undefined, field: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({ title: 'Copied', description: `${field} copied to clipboard.` })
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleContact = async () => {
    if (!lead) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/leads/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      })
      const result = await res.json()
      if (result.success && result.email?.mailtoLink) {
        window.open(result.email.mailtoLink, '_blank')
        toast({
          title: 'Opening email client',
          description: `Composing email to ${getDisplayClientName(lead.clientName)} at ${lead.clientEmail}`,
        })
      }
    } catch {
      toast({
        title: 'Email client error',
        description: 'Could not open email client. Try copying the email manually.',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleFlag = () => {
    toast({
      title: 'Lead flagged',
      description: 'This lead has been marked for review.',
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-hidden border-border bg-[#0A0A0A] p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="sr-only">Lead detail</DialogTitle>
          <DialogDescription className="sr-only">
            Full lead information and client contact details
          </DialogDescription>
        </DialogHeader>

        {isLoading || !lead || !cat || !catColor ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-2/3 bg-[#111111]" />
            <Skeleton className="h-4 w-1/3 bg-[#111111]" />
            <Skeleton className="h-24 w-full bg-[#111111]" />
            <Skeleton className="h-32 w-full bg-[#111111]" />
          </div>
        ) : (
          <div className="flex max-h-[80vh] flex-col overflow-y-auto scrollbar-premium">
            {/* Header section */}
            <div className="border-b border-border px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`gap-1 border ${catColor.border} ${catColor.bg} ${catColor.text} font-medium`}
                >
                  {cat.name}
                </Badge>
                {lead.subcategory && (
                  <Badge
                    variant="outline"
                    className="border-border bg-white/5 text-xs text-muted-foreground"
                  >
                    {lead.subcategory}
                  </Badge>
                )}
                {lead.urgent && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-red-500/30 bg-red-500/10 font-medium text-red-400"
                  >
                    <Flame className="h-3 w-3" />
                    Urgent
                  </Badge>
                )}
                {lead.featured && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-[#F59E0B]/30 bg-[#F59E0B]/10 font-medium text-[#F59E0B]"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                )}
                {pitchSent && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-green-500/30 bg-green-500/10 font-medium text-green-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Sent
                  </Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  Posted {timeAgo(lead.createdAt)}
                </span>
              </div>
              <h2
                className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {lead.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {getCountryFlag(lead.country)} {lead.city ? `${lead.city}, ` : ''}
                  {getCountryName(lead.country)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {lead.clientCompany || 'Private client'}
                </span>
                {lead.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {lead.views} views
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="grid gap-6 px-6 py-5 lg:grid-cols-3">
              {/* Left: description + skills + source */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project brief
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {lead.description}
                </p>

                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Required skills
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lead.skills.split(',').map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground/80"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>

                {/* Source info */}
                <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lead source
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-border text-xs text-foreground"
                  >
                    {LEAD_SOURCE_LABELS[lead.source] || lead.source}
                  </Badge>
                  {lead.sourceUrl && (
                    <a
                      href={lead.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D9FA54] transition-colors hover:text-[#D9FA54]/80"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View source
                      <span className="max-w-[200px] truncate text-muted-foreground">
                        ({lead.sourceUrl})
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right: budget card + specs + client */}
              <aside className="space-y-4">
                {/* Budget card */}
                <div className="rounded-xl border border-[#D9FA54]/20 bg-[#D9FA54]/5 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D9FA54]">
                    <DollarSign className="h-3.5 w-3.5" />
                    Budget
                  </div>
                  <div
                    className="mt-1 text-2xl font-bold tracking-tight text-[#D9FA54]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {formatBudget(lead.budgetMin, lead.budgetMax, lead.currency)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{lead.currency}</div>
                </div>

                {/* Specs */}
                <div className="rounded-xl border border-border bg-[#111111] p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project specs
                  </h4>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Timeline
                      </dt>
                      <dd className="font-medium text-foreground">{lead.timeline}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" /> Subcategory
                      </dt>
                      <dd className="font-medium text-foreground">
                        {lead.subcategory || '—'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Type
                      </dt>
                      <dd className="font-medium text-foreground">
                        {lead.projectType || 'One-off'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Experience
                      </dt>
                      <dd className="font-medium text-foreground">
                        {lead.experienceReq || 'Any level'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Client card — FULL CONTACT DETAILS */}
                <div className="rounded-xl border border-border bg-[#111111] p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Client contact
                  </h4>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9FA54]/10 text-sm font-semibold text-[#D9FA54]">
                      {getDisplayClientName(lead.clientName).charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {getDisplayClientName(lead.clientName)}
                      </div>
                      {lead.clientCompany && (
                        <div className="truncate text-xs text-muted-foreground">
                          {lead.clientCompany}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    {/* Email */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => copyToClipboard(lead.clientEmail, 'Email')}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.clientEmail}</span>
                      </button>
                      {copiedField === 'Email' ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#D9FA54]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 shrink-0 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground" onClick={() => copyToClipboard(lead.clientEmail, 'Email')} />
                      )}
                    </div>
                    {/* Phone */}
                    {lead.clientPhone && (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => copyToClipboard(lead.clientPhone, 'Phone')}
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{lead.clientPhone}</span>
                        </button>
                        {copiedField === 'Phone' ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#D9FA54]" />
                        ) : (
                          <>
                            {getWhatsAppLink(lead.clientPhone) && (
                              <a
                                href={getWhatsAppLink(lead.clientPhone) || undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 transition-colors hover:text-green-300"
                                aria-label="Open WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                              </a>
                            )}
                            <Copy className="h-3.5 w-3.5 shrink-0 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground" onClick={() => copyToClipboard(lead.clientPhone, 'Phone')} />
                          </>
                        )}
                      </div>
                    )}
                    {/* Address */}
                    {lead.clientAddress && (
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => copyToClipboard(lead.clientAddress, 'Address')}
                          className="flex min-w-0 flex-1 items-start gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{lead.clientAddress}</span>
                        </button>
                        {copiedField === 'Address' ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#D9FA54] mt-0.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 shrink-0 cursor-pointer text-muted-foreground/40 hover:text-muted-foreground mt-0.5" onClick={() => copyToClipboard(lead.clientAddress, 'Address')} />
                        )}
                      </div>
                    )}
                    {/* LinkedIn */}
                    {lead.clientLinkedin && (
                      <a
                        href={lead.clientLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#0A76FF] transition-colors hover:text-[#0A76FF]/80"
                      >
                        <Linkedin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">LinkedIn Profile</span>
                        <ExternalLink className="ml-auto h-3 w-3 shrink-0" />
                      </a>
                    )}
                    {/* Website */}
                    {lead.clientWebsite && (
                      <a
                        href={lead.clientWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{lead.clientWebsite}</span>
                        <ExternalLink className="ml-auto h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              </aside>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-[#0A0A0A]/95 px-6 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading !== null}
                  className="border-[#D9FA54]/30 text-[#D9FA54] hover:bg-[#D9FA54]/10"
                >
                  {downloading === 'pdf' ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload('jpeg')}
                  disabled={downloading !== null}
                  className="border-[#D9FA54]/30 text-[#D9FA54] hover:bg-[#D9FA54]/10"
                >
                  {downloading === 'jpeg' ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlag}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  <Flag className="mr-1.5 h-3.5 w-3.5" />
                  Flag
                </Button>
                {lead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPitchOpen(true)}
                    className="border-[#D9FA54]/30 text-[#D9FA54] hover:bg-[#D9FA54]/10"
                  >
                    {pitchSent ? (
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {pitchSent ? 'Sent' : 'Send Pitch'}
                  </Button>
                )}
                {getWhatsAppLink(lead.clientPhone) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getWhatsAppLink(lead.clientPhone) || undefined, '_blank')}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleContact}
                disabled={sendingEmail}
                className="gap-2 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
              >
                {sendingEmail ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Contact Client
              </Button>
            </div>
          </div>
        )}

        {/* Email Pitch Dialog */}
        {lead && (
          <EmailPitchDialog
            lead={lead}
            open={pitchOpen}
            onClose={() => setPitchOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
