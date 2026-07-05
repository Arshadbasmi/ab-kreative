import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

// POST /api/send-email — Send a pitch email directly via SMTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, from, smtpHost, smtpPort, smtpUser, smtpPass } = body

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Recipient email, subject, and body are required.' },
        { status: 400 }
      )
    }
    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP configuration is missing. Please configure your email settings first.' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const senderEmail = from || smtpUser

    // Send email
    const info = await transporter.sendMail({
      from: `"AB Kreative" <${senderEmail}>`,
      to,
      subject,
      text: emailBody,
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
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
    if (msg.includes('Invalid login') || msg.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'SMTP authentication failed. Check your email and app password.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: `Failed to send email: ${msg}` },
      { status: 500 }
    )
  }
}