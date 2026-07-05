'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useToast } from '@/hooks/use-toast'
import {
  Send,
  Mail,
  Loader2,
  Settings,
  Eye,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { type Lead, getPitchTemplate, type EmailTemplate } from '@/lib/email-templates'

/* ------------------------------------------------------------------ */
/*  SMTP Settings (persisted in localStorage)                           */
/* ------------------------------------------------------------------ */

interface SmtpSettings {
  fromEmail: string
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPass: string
}

const SMTP_STORAGE_KEY = 'abkreative_smtp_settings'

function loadSmtpSettings(): SmtpSettings {
  if (typeof window === 'undefined') {
    return { fromEmail: '', smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '' }
  }
  try {
    const raw = localStorage.getItem(SMTP_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { fromEmail: '', smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '' }
}

function saveSmtpSettings(settings: SmtpSettings) {
  localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(settings))
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmailPitchDialog({
  lead,
  open,
  onClose,
}: {
  lead: Lead
  open: boolean
  onClose: () => void
}) {
  const { toast } = useToast()

  // SMTP settings
  const [smtp, setSmtp] = useState<SmtpSettings>(loadSmtpSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Email content
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Initialize template when dialog opens
  useEffect(() => {
    if (open && lead) {
      setSmtp(loadSmtpSettings())
      setSent(false)
      setIsEditing(false)
      const template: EmailTemplate = getPitchTemplate(lead.category, {
        clientName: lead.clientName,
        title: lead.title,
        clientCompany: lead.clientCompany,
        subcategory: lead.subcategory,
        budgetMin: lead.budgetMin,
        budgetMax: lead.budgetMax,
        currency: lead.currency,
        country: lead.country,
        city: lead.city,
      })
      setSubject(template.subject)
      setBody(template.body)
    }
  }, [open, lead])

  const handleSaveSettings = useCallback(() => {
    saveSmtpSettings(smtp)
    setSettingsOpen(false)
    toast({ title: 'Settings saved', description: 'Your email settings are saved locally.' })
  }, [smtp, toast])

  const handleSend = async () => {
    if (!smtp.smtpUser || !smtp.smtpPass) {
      setSettingsOpen(true)
      toast({
        title: 'Configure email first',
        description: 'Add your email settings before sending.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.clientEmail,
          subject,
          body,
          from: smtp.fromEmail || smtp.smtpUser,
          smtpHost: smtp.smtpHost,
          smtpPort: smtp.smtpPort,
          smtpUser: smtp.smtpUser,
          smtpPass: smtp.smtpPass,
        }),
      })
      const result = await res.json()

      if (result.success) {
        setSent(true)
        toast({
          title: 'Email sent!',
          description: `Pitch sent to ${lead.clientName} at ${lead.clientEmail}`,
        })
      } else {
        toast({
          title: 'Failed to send',
          description: result.error || 'Unknown error. Check your SMTP settings.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not reach the server. Try again.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleOpenMailto = () => {
    const link = `mailto:${lead.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(link, '_blank')
  }

  const isConfigured = !!(smtp.smtpUser && smtp.smtpPass)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-2xl overflow-hidden border-border bg-[#0A0A0A] p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Send Pitch Email
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                to {lead.clientName} &lt;{lead.clientEmail}&gt;
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {sent ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sent
                </span>
              ) : isConfigured ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[#D9FA54]/10 px-3 py-1 text-xs font-medium text-[#D9FA54]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Email configured
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Setup required
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex max-h-[75vh] flex-col overflow-y-auto scrollbar-premium">
          {/* Email Settings Accordion */}
          <div className="border-b border-border px-6 py-3">
            <Accordion type="single" collapsible value={settingsOpen ? 'settings' : undefined} onValueChange={(v) => setSettingsOpen(!!v)}>
              <AccordionItem value="settings" className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Your Email Settings (SMTP)</span>
                    {isConfigured && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-3 space-y-3 rounded-lg border border-border bg-[#111111] p-4">
                    <p className="text-xs text-muted-foreground">
                      Enter your email credentials to send pitches directly. Settings are saved locally on your device.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Your Email (From)</Label>
                        <Input
                          type="email"
                          placeholder="arshad@abkreative.com"
                          value={smtp.fromEmail}
                          onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))}
                          className="border-border bg-[#0A0A0A] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">SMTP Host</Label>
                        <Input
                          placeholder="smtp.gmail.com"
                          value={smtp.smtpHost}
                          onChange={(e) => setSmtp((s) => ({ ...s, smtpHost: e.target.value }))}
                          className="border-border bg-[#0A0A0A] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">SMTP Port</Label>
                        <Input
                          placeholder="587"
                          value={smtp.smtpPort}
                          onChange={(e) => setSmtp((s) => ({ ...s, smtpPort: e.target.value }))}
                          className="border-border bg-[#0A0A0A] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">SMTP Username (Email)</Label>
                        <Input
                          type="email"
                          placeholder="your@gmail.com"
                          value={smtp.smtpUser}
                          onChange={(e) => setSmtp((s) => ({ ...s, smtpUser: e.target.value }))}
                          className="border-border bg-[#0A0A0A] text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">App Password (not your regular password)</Label>
                      <Input
                        type="password"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={smtp.smtpPass}
                        onChange={(e) => setSmtp((s) => ({ ...s, smtpPass: e.target.value }))}
                        className="border-border bg-[#0A0A0A] text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground/70">
                        Gmail: go to Google Account → Security → 2-Step Verification → App passwords → Create
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleSaveSettings} className="w-full border-border text-sm">
                      <Server className="mr-1.5 h-3.5 w-3.5" />
                      Save Settings
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Email Compose */}
          <div className="flex-1 px-6 py-4 space-y-4">
            {/* To field */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-[#111111] px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{lead.clientEmail}</span>
                {lead.clientCompany && (
                  <span className="text-xs text-muted-foreground">({lead.clientCompany})</span>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-border bg-[#111111] text-sm font-medium"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Message</Label>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 text-xs text-[#D9FA54] hover:underline"
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-3 w-3" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3 w-3" />
                      Edit
                    </>
                  )}
                </button>
              </div>
              {isEditing ? (
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={14}
                  className="border-border bg-[#111111] text-sm leading-relaxed resize-none"
                />
              ) : (
                <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border bg-[#111111] p-4 scrollbar-premium">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                    {body}
                  </pre>
                </div>
              )}
            </div>

            {/* Quick info about the lead */}
            <div className="rounded-lg border border-[#D9FA54]/10 bg-[#D9FA54]/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D9FA54]">
                Lead Context
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Category: <strong className="text-foreground">{lead.category}</strong></span>
                {lead.subcategory && <span>Type: <strong className="text-foreground">{lead.subcategory}</strong></span>}
                <span>Budget: <strong className="text-[#D9FA54]">${lead.budgetMin.toLocaleString()} – ${lead.budgetMax.toLocaleString()}</strong></span>
                <span>Location: <strong className="text-foreground">{lead.city || ''} {lead.country}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-[#0A0A0A]/95 px-6 py-3 backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenMailto}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Open in email app
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending || sent}
            className="gap-2 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
          >
            {sent ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sent
              </>
            ) : sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send Pitch
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}