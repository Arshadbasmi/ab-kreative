import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getServerEmailConfig } from '@/lib/server-email-config'
import {
  initTursoClient,
  tursoEnsurePitchColumns,
  tursoMarkLeadPitchFailed,
  tursoMarkLeadPitchSent,
} from '@/lib/turso-client'

export const dynamic = 'force-dynamic'

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// POST /api/send-email — Send a pitch email directly via SMTP
export async function POST(request: NextRequest) {
  let leadIdForStatus = ''

  try {
    const body = await request.json()
    const {
      to,
      subject,
      body: emailBody,
      from,
      fromName,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      routeId,
      category,
      leadId,
      bcc,
      replyTo,
    } = body
    leadIdForStatus = optionalString(leadId)

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Recipient email, subject, and body are required.' },
        { status: 400 }
      )
    }

    const hasBrowserSmtp = Boolean(optionalString(smtpHost) && optionalString(smtpUser) && optionalString(smtpPass))
    const serverConfig = getServerEmailConfig({ routeId, category })
    const effectiveSmtpHost = hasBrowserSmtp ? optionalString(smtpHost) : serverConfig?.smtpHost || ''
    const effectiveSmtpPort = hasBrowserSmtp ? optionalString(smtpPort) || '587' : serverConfig?.smtpPort || '587'
    const effectiveSmtpUser = hasBrowserSmtp ? optionalString(smtpUser) : serverConfig?.smtpUser || ''
    const effectiveSmtpPass = hasBrowserSmtp ? optionalString(smtpPass) : serverConfig?.smtpPass || ''
    const senderEmail = hasBrowserSmtp
      ? optionalString(from) || effectiveSmtpUser
      : serverConfig?.fromEmail || optionalString(from) || effectiveSmtpUser
    const senderName = hasBrowserSmtp
      ? optionalString(fromName) || 'AB Kreative'
      : serverConfig?.fromName || optionalString(fromName) || 'AB Kreative'

    if (!effectiveSmtpHost || !effectiveSmtpUser || !effectiveSmtpPass) {
      return NextResponse.json(
        {
          error:
            'SMTP configuration is missing. Add server email variables in Vercel, or configure this sender in the Emails dashboard.',
        },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: effectiveSmtpHost,
      port: Number(effectiveSmtpPort) || 587,
      secure: Number(effectiveSmtpPort) === 465,
      auth: {
        user: effectiveSmtpUser,
        pass: effectiveSmtpPass,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      bcc: bcc || senderEmail,
      replyTo: replyTo || senderEmail,
      subject,
      text: emailBody,
    })

    if (leadIdForStatus && process.env.TURSO_DATABASE_URL) {
      try {
        const ready = await initTursoClient()
        if (ready) {
          await tursoEnsurePitchColumns()
          await tursoMarkLeadPitchSent(leadIdForStatus)
        }
      } catch (statusError) {
        console.error('Pitch sent status update failed:', statusError)
      }
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      from: senderEmail,
      copiedTo: bcc || senderEmail,
      routeId,
      category,
      configSource: hasBrowserSmtp ? 'browser' : 'server',
      message: `Email sent successfully to ${to}`,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('POST /api/send-email error:', msg)

    try {
      if (leadIdForStatus && process.env.TURSO_DATABASE_URL) {
        const ready = await initTursoClient()
        if (ready) {
          await tursoEnsurePitchColumns()
          await tursoMarkLeadPitchFailed(leadIdForStatus, msg)
        }
      }
    } catch {}

    // Return user-friendly error messages for common SMTP issues
    if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { error: 'Could not connect to the SMTP server. Check your host and port.' },
        { status: 502 }
      )
    }
    if (
      msg.includes('Invalid login') ||
      msg.includes('Authentication failed') ||
      msg.includes('EAUTH') ||
      msg.includes('535') ||
      msg.includes('534') ||
      msg.includes('Username and Password not accepted')
    ) {
      return NextResponse.json(
        {
          error:
            'SMTP authentication failed. Choose the correct email provider, use the full mailbox as username, and enter the mailbox/app password.',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: `Failed to send email: ${msg}` },
      { status: 500 }
    )
  }
}
