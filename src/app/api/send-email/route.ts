import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getServerEmailConfig } from '@/lib/server-email-config'

export const dynamic = 'force-dynamic'

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// POST /api/send-email — Send a pitch email directly via SMTP
export async function POST(request: NextRequest) {
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
      bcc,
      replyTo,
    } = body

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Recipient email, subject, and body are required.' },
        { status: 400 }
      )
    }

    const serverConfig = getServerEmailConfig({ routeId, category })
    const hasBrowserSmtp = Boolean(optionalString(smtpHost) && optionalString(smtpUser) && optionalString(smtpPass))
    const effectiveSmtpHost = optionalString(smtpHost) || serverConfig?.smtpHost || ''
    const effectiveSmtpPort = optionalString(smtpPort) || serverConfig?.smtpPort || '587'
    const effectiveSmtpUser = optionalString(smtpUser) || serverConfig?.smtpUser || ''
    const effectiveSmtpPass = optionalString(smtpPass) || serverConfig?.smtpPass || ''
    const senderEmail = optionalString(from) || serverConfig?.fromEmail || effectiveSmtpUser
    const senderName = optionalString(fromName) || serverConfig?.fromName || 'AB Kreative'

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
