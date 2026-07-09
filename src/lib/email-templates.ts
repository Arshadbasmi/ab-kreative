// ─────────────────────────────────────────────────────────────────────────────
// AB Kreative — Email Pitch Templates
// Dubai-based creative agency. Dark theme #0A0A0A, accent #D9FA54, Space Grotesk.
// ─────────────────────────────────────────────────────────────────────────────

export type EmailTemplate = {
  subject: string
  body: string
}

export type PitchContext = {
  clientName: string
  title: string
  clientCompany?: string | null
  subcategory?: string | null
  budgetMin?: number
  budgetMax?: number
  currency?: string
  country?: string
  city?: string | null
  senderName?: string | null
}

function getCleanClientName(name: string): string {
  const cleaned = name.trim()
  return /^not specified$/i.test(cleaned) ? "" : cleaned
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  // ── 1. DESIGN ────────────────────────────────────────────────────────────
  DESIGN: {
    subject: "{{clientName}} — Bringing Your Vision for {{projectTitle}} to Life",
    body: `Hi {{greetingName}},

I came across your project "{{projectTitle}}" and wanted to reach out. At AB Kreative, we specialize in turning ambitious design concepts into striking realities across the UAE.

From interior and architectural design to brand identity, 3D visualization, and web design, our team delivers work that doesn't just look exceptional — it drives results. We've helped businesses across Dubai stand out through bold, purposeful design{{subcategory}}.

I'd love to learn more about your vision and explore how we can make it happen. Are you available for a quick call this week?

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  // ── 2. FITOUT ────────────────────────────────────────────────────────────
  FITOUT: {
    subject: "{{clientName}} — Expert Fitout Solutions for {{projectTitle}}",
    body: `Hi {{greetingName}},

I noticed your project "{{projectTitle}}" and wanted to introduce AB Kreative as a partner who can deliver it end to end.

We handle full-scale interior fitouts, construction, renovation, and MEP works across Dubai — from concept to handover{{subcategory}}. Our clients trust us for turnkey execution that's on time, on budget, and built to the highest standards.

I'd appreciate the chance to discuss your requirements in more detail. Could we schedule a brief call to explore how we can support you?

Best Regards,
Ab Kreative Design & Fitout
www.abkreative.com`,
  },

  // ── 3. FINANCE ───────────────────────────────────────────────────────────
  FINANCE: {
    subject: "{{clientName}} — UAE Credit Card & Loan Options for {{projectTitle}}",
    body: `Hi {{greetingName}},

I saw your interest in "{{projectTitle}}" and wanted to connect. AB Kreative helps UAE residents and businesses find suitable credit card and loan options through trusted banking partners.

Whether you are looking for a credit card, personal loan, business loan, auto finance, loan buyout, or debt consolidation, we can quickly check the right options for your profile{{subcategory}}. Final approval and eligibility remain subject to the bank's criteria.

Could you share your salary range, company name, and whether your salary is transferred to a UAE bank? I can then guide you to the most relevant options.

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  CREDIT_CARD: {
    subject: "{{clientName}} — UAE Credit Card & Loan Options for {{projectTitle}}",
    body: `Hi {{greetingName}},

I saw your interest in "{{projectTitle}}" and wanted to connect. AB Kreative helps UAE residents and businesses find suitable credit card and loan options through trusted banking partners.

Whether you are looking for a credit card, personal loan, business loan, auto finance, loan buyout, or debt consolidation, we can quickly check the right options for your profile{{subcategory}}. Final approval and eligibility remain subject to the bank's criteria.

Could you share your salary range, company name, and whether your salary is transferred to a UAE bank? I can then guide you to the most relevant options.

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  // ── 4. LOGISTICS ─────────────────────────────────────────────────────────
  LOGISTICS: {
    subject: "{{clientName}} — Reliable Logistics for {{projectTitle}}",
    body: `Hi {{greetingName}},

Your project "{{projectTitle}}" caught my attention, and I believe AB Kreative can add real value to your supply chain.

We provide comprehensive logistics solutions across the UAE — freight forwarding, warehousing, shipping, and last-mile delivery{{subcategory}}. Our network and operational expertise ensure your goods move efficiently, reliably, and cost-effectively.

I'd welcome the opportunity to understand your logistics needs and show you how we can optimize them. Would a short call work for you this week?

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  // ── 5. UAE_APPROVALS ─────────────────────────────────────────────────────
  UAE_APPROVALS: {
    subject: "{{clientName}} — Navigating UAE Approvals for {{projectTitle}}",
    body: `Hi {{greetingName}},

I came across your project "{{projectTitle}}" and wanted to reach out. Securing government approvals in the UAE can be complex — that's where AB Kreative steps in.

We handle the full spectrum: municipality approvals, DCD, DEWA, Trakhees, and every other regulatory clearance required to keep your project moving{{subcategory}}. Our team knows the processes inside out and cuts through the red tape so you don't have to.

I'd like to discuss how we can accelerate your approvals. Are you open to a brief call this week?

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  // ── 6. DUBAI_BUSINESS_SETUP ──────────────────────────────────────────────
  DUBAI_BUSINESS_SETUP: {
    subject: "{{clientName}} — Launch Your Business in Dubai with AB Kreative",
    body: `Hi {{greetingName}},

I noticed your interest in "{{projectTitle}}" and wanted to connect. Setting up a business in Dubai should be exciting — not exhausting — and AB Kreative makes sure it is.

We handle everything: company formation, free zone and mainland licensing, visa processing, PRO services, golden visa applications, and corporate bank account setup{{subcategory}}. Our clients get a seamless, end-to-end experience from day one.

I'd love to walk you through your best options based on your goals. Can we schedule a quick call this week?

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },

  // ── 7. VIRAL_PRODUCTS / DROPSHIPPING ────────────────────────────────────
  VIRAL_PRODUCTS: {
    subject: "{{clientName}} — Dropshipping Product Sourcing for {{projectTitle}}",
    body: `Hi {{greetingName}},

I came across "{{projectTitle}}" and wanted to connect. AB Kreative is building ecommerce and dropshipping product pipelines for fast-moving UAE and international markets.

We are especially interested in high-margin, lightweight, trending products{{subcategory}} with reliable supply, clear pricing, fast dispatch, and reseller or dropshipping support.

Could you share your product catalog, MOQ, wholesale pricing, shipping options, and whether you support dropshipping or white-label supply?

Best regards,
{{senderName}} | AB Kreative | www.abkreative.com`,
  },
}

// ─── Placeholder Resolver ────────────────────────────────────────────────────

function formatBudget(ctx: PitchContext): string {
  const symbol = ctx.currency === "AED" ? "AED " : ctx.currency ? `${ctx.currency} ` : "$"
  const min = ctx.budgetMin ?? null
  const max = ctx.budgetMax ?? null

  if (min != null && max != null && min !== max) return `${symbol}${min.toLocaleString()} – ${symbol}${max.toLocaleString()}`
  if (min != null && max != null) return `${symbol}${min.toLocaleString()}`
  if (min != null) return `from ${symbol}${min.toLocaleString()}`
  if (max != null) return `up to ${symbol}${max.toLocaleString()}`
  return ""
}

function formatLocation(ctx: PitchContext): string {
  if (ctx.city && ctx.country) return `${ctx.city}, ${ctx.country}`
  if (ctx.city) return ctx.city
  if (ctx.country) return ctx.country
  return ""
}

function resolvePlaceholders(text: string, ctx: PitchContext): string {
  const budget = formatBudget(ctx)
  const location = formatLocation(ctx)
  const senderName = ctx.senderName?.trim() || "Arshad"
  const cleanClientName = getCleanClientName(ctx.clientName)
  const subjectClientName = cleanClientName || ctx.clientCompany?.trim() || "Project"
  const greetingName = cleanClientName || "there"

  // Build a dynamic subcategory mention (e.g. ", particularly in 3D visualization")
  const subcategoryClause =
    ctx.subcategory
      ? `, particularly in ${ctx.subcategory}`
      : ""

  return text
    .replace(/\{\{clientName\}\}/g, subjectClientName)
    .replace(/\{\{greetingName\}\}/g, greetingName)
    .replace(/\{\{companyName\}\}/g, ctx.clientCompany ?? "")
    .replace(/\{\{projectTitle\}\}/g, ctx.title)
    .replace(/\{\{subcategory\}\}/g, subcategoryClause)
    .replace(/\{\{budget\}\}/g, budget)
    .replace(/\{\{location\}\}/g, location)
    .replace(/\{\{senderName\}\}/g, senderName)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getPitchTemplate(category: string, lead: PitchContext): EmailTemplate {
  const template = EMAIL_TEMPLATES[category]
  const senderName = lead.senderName?.trim() || "Arshad"
  const cleanClientName = getCleanClientName(lead.clientName)
  const subjectClientName = cleanClientName || lead.clientCompany?.trim() || "Project"
  const greetingName = cleanClientName || "there"

  if (!template) {
    return {
      subject: `${subjectClientName} — Let's Discuss Your Project`,
      body: `Hi ${greetingName},

Thank you for your interest in "${lead.title}"${lead.clientCompany ? ` at ${lead.clientCompany}` : ""}. At AB Kreative, we'd love to learn more about how we can help.

Could we schedule a brief call to explore the right solution for you?

Best regards,
${senderName} | AB Kreative | www.abkreative.com`,
    }
  }

  return {
    subject: resolvePlaceholders(template.subject, lead),
    body: resolvePlaceholders(template.body, lead),
  }
}
