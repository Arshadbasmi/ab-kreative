import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getPitchTemplate } from '@/lib/email-templates'
import { getServerEmailConfig } from '@/lib/server-email-config'
import {
  initTursoClient,
  tursoEnsurePitchColumns,
  tursoFindUnsentPitchLeads,
  tursoMarkLeadPitchFailed,
  tursoMarkLeadPitchSent,
} from '@/lib/turso-client'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.AUTOMATION_SECRET || process.env.CRON_SECRET
  if (!secret) return true

  const auth = request.headers.get('authorization') || ''
  const querySecret = new URL(request.url).searchParams.get('secret') || ''
  return auth === `Bearer ${secret}` || querySecret === secret
}

function getLimit(request: NextRequest): number {
  const urlLimit = Number(new URL(request.url).searchParams.get('limit'))
  const envLimit = Number(process.env.AUTOMATION_DAILY_PITCH_LIMIT)
  const limit = Number.isFinite(urlLimit) && urlLimit > 0 ? urlLimit : envLimit || 5
  return Math.max(1, Math.min(limit, 25))
}

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized automation request' }, { status: 401 })
  }

  if (process.env.AUTOMATION_SEND_PITCHES !== 'enabled') {
    return NextResponse.json({
      success: true,
      enabled: false,
      message: 'Pitch automation is disabled. Set AUTOMATION_SEND_PITCHES=enabled to activate.',
    })
  }

  if (!process.env.TURSO_DATABASE_URL) {
    return NextResponse.json(
      { error: 'TURSO_DATABASE_URL is required for permanent automation.' },
      { status: 400 },
    )
  }

  const ready = await initTursoClient()
  if (!ready) {
    return NextResponse.json({ error: 'Turso connection failed' }, { status: 503 })
  }

  await tursoEnsurePitchColumns()
  const leads = await tursoFindUnsentPitchLeads(getLimit(request))
  const results: Array<{
    id: string
    email: string
    status: 'sent' | 'failed' | 'skipped'
    error?: string
  }> = []

  for (const lead of leads) {
    const emailConfig = getServerEmailConfig({
      category: lead.category,
    })

    if (!emailConfig) {
      const error = `No server SMTP configured for ${lead.category}`
      await tursoMarkLeadPitchFailed(lead.id, error)
      results.push({ id: lead.id, email: lead.clientEmail, status: 'failed', error })
      continue
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

    try {
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: Number(emailConfig.smtpPort) || 587,
        secure: Number(emailConfig.smtpPort) === 465,
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPass,
        },
      })

      await transporter.sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: lead.clientEmail,
        bcc: emailConfig.fromEmail,
        replyTo: emailConfig.fromEmail,
        subject: template.subject,
        text: template.body,
      })

      await tursoMarkLeadPitchSent(lead.id)
      results.push({ id: lead.id, email: lead.clientEmail, status: 'sent' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await tursoMarkLeadPitchFailed(lead.id, message)
      results.push({ id: lead.id, email: lead.clientEmail, status: 'failed', error: message })
    }
  }

  return NextResponse.json({
    success: true,
    enabled: true,
    processed: results.length,
    sent: results.filter((result) => result.status === 'sent').length,
    failed: results.filter((result) => result.status === 'failed').length,
    results,
  })
}
