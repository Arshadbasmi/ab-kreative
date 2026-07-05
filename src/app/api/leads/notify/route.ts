import { NextRequest, NextResponse } from 'next/server'
import { db, isDbAvailable, getDbReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/leads/notify — Send email notification when contacting a lead
export async function POST(request: NextRequest) {
  try {
    await getDbReady()
    if (!isDbAvailable()) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const body = await request.json()
    const { leadId, message } = body

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const lead = await db.lead.findUnique({ where: { id: leadId } })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Build email content
    const subject = `AB Kreative — Inquiry: ${lead.title}`
    const emailBody = `
AB Kreative Lead Inquiry
========================

Lead: ${lead.title}
Category: ${lead.category}${lead.subcategory ? ` / ${lead.subcategory}` : ''}
Budget: $${lead.budgetMin} – $${lead.budgetMax} ${lead.currency}
Timeline: ${lead.timeline}
Location: ${lead.city ? `${lead.city}, ` : ''}${lead.country}

Client: ${lead.clientName}
Company: ${lead.clientCompany || 'N/A'}
Email: ${lead.clientEmail}
Phone: ${lead.clientPhone || 'N/A'}
Address: ${lead.clientAddress || 'N/A'}

${message ? `Message from interested party:\n${message}\n` : ''}

---
This inquiry was sent via AB Kreative Lead Generation Platform
    `.trim()

    // In production, integrate with a real email service (Resend, SendGrid, Nodemailer, etc.)
    // For now, we return the composed email data so the frontend can open mailto:
    // To enable real email sending, uncomment below and configure SMTP or API keys.

    /*
    // Example: Using Nodemailer with SMTP
    import nodemailer from 'nodemailer'
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'leads@abkreative.com',
      to: lead.clientEmail,
      subject,
      text: emailBody,
    })
    */

    // Increment views to track interest
    await db.lead.update({
      where: { id: leadId },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      email: {
        to: lead.clientEmail,
        subject,
        body: emailBody,
        mailtoLink: `mailto:${lead.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`,
      },
    })
  } catch (error) {
    console.error('POST /api/leads/notify error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}