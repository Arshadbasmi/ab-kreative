import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import {
  type Lead,
  formatBudget,
  getCategoryMeta,
  getCountryFlag,
  getCountryName,
  LEAD_SOURCE_LABELS,
} from '@/lib/constants'

const CATEGORY_HEX: Record<string, string> = {
  DESIGN: '#D9FA54',
  FITOUT: '#FF6B35',
  CREDIT_CARD: '#E5318A',
  LOGISTICS: '#06B6D4',
  UAE_APPROVALS: '#F59E0B',
  DUBAI_BUSINESS_SETUP: '#10B981',
}

function esc(str: string | null | undefined): string {
  if (!str) return '—'
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildLeadHTML(lead: Lead): string {
  const cat = getCategoryMeta(lead.category)
  const catColor = CATEGORY_HEX[lead.category] || '#D9FA54'
  const skills = lead.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const budget = formatBudget(lead.budgetMin, lead.budgetMax, lead.currency)
  const flag = getCountryFlag(lead.country)
  const countryName = getCountryName(lead.country)
  const location = lead.city ? `${lead.city}, ${countryName}` : countryName
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const sourceLabel = LEAD_SOURCE_LABELS[lead.source] || lead.source

  const skillPills = skills
    .map(
      (s) =>
        `<span style="display:inline-block;padding:4px 12px;border-radius:6px;background:${catColor}15;color:${catColor};font-size:12px;font-weight:500;border:1px solid ${catColor}30;">${esc(s)}</span>`
    )
    .join(' ')

  const badges: string[] = []
  badges.push(
    `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 14px;border-radius:6px;background:${catColor}18;color:${catColor};font-size:12px;font-weight:600;border:1px solid ${catColor}35;">${esc(cat.name)}</span>`
  )
  if (lead.subcategory) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;padding:4px 14px;border-radius:6px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);font-size:12px;font-weight:500;border:1px solid rgba(255,255,255,0.1);">${esc(lead.subcategory)}</span>`
    )
  }
  if (lead.urgent) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 14px;border-radius:6px;background:rgba(239,68,68,0.12);color:#f87171;font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.3);">🔥 Urgent</span>`
    )
  }
  if (lead.featured) {
    badges.push(
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 14px;border-radius:6px;background:rgba(245,158,11,0.12);color:#fbbf24;font-size:12px;font-weight:600;border:1px solid rgba(245,158,11,0.3);">⭐ Featured</span>`
    )
  }

  const specRow = (label: string, value: string, color?: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;color:rgba(255,255,255,0.45);font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:${color || 'rgba(255,255,255,0.9)'};font-weight:${color ? '700' : '500'};">${value}</td>
    </tr>`

  const contactRow = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 16px 6px 0;color:rgba(255,255,255,0.45);font-size:12px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.85);word-break:break-all;">${value}</td>
    </tr>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0A0A0A; }
</style>
</head>
<body>
<div style="width:800px;background:#0A0A0A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;color:#fff;">

  <!-- Header / Logo -->
  <div style="padding:32px 40px 24px 40px;">
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:44px;height:44px;background:#D9FA54;border-radius:10px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:20px;font-weight:800;color:#0A0A0A;letter-spacing:-1px;">AB</span>
      </div>
      <div>
        <div style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.5px;">AB Kreative</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px;margin-top:1px;">Lead Generation Platform</div>
      </div>
    </div>
    <div style="margin-top:24px;height:2px;background:linear-gradient(90deg,#D9FA54,rgba(217,250,84,0.1));border-radius:2px;"></div>
  </div>

  <!-- Badges -->
  <div style="padding:0 40px 16px 40px;">
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${badges.join('')}
    </div>
  </div>

  <!-- Title -->
  <div style="padding:0 40px 20px 40px;">
    <h1 style="font-size:26px;font-weight:800;color:#ffffff;line-height:1.3;letter-spacing:-0.5px;">${esc(lead.title)}</h1>
  </div>

  <!-- Description -->
  <div style="padding:0 40px 24px 40px;">
    <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.65);">${esc(lead.description)}</p>
  </div>

  <!-- Skills -->
  <div style="padding:0 40px 28px 40px;">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.35);margin-bottom:10px;">Required Skills</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${skillPills}
    </div>
  </div>

  <!-- Specs grid -->
  <div style="padding:0 40px 28px 40px;">
    <div style="background:#111111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
      <div style="padding:16px 20px 8px 20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.35);">Project Details</div>
      <table style="width:100%;border-collapse:collapse;padding:0 20px;">
        <tbody>
          ${specRow('Budget', budget, '#D9FA54')}
          ${specRow('Timeline', esc(lead.timeline))}
          ${specRow('Location', `${flag} ${esc(location)}`)}
          ${specRow('Project Type', esc(lead.projectType || 'One-off'))}
          ${specRow('Experience', esc(lead.experienceReq || 'Any level'))}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Client Contact -->
  <div style="padding:0 40px 28px 40px;">
    <div style="background:#111111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
      <div style="padding:16px 20px 8px 20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.35);">Client Contact</div>
      <table style="width:100%;border-collapse:collapse;padding:0 20px;">
        <tbody>
          ${contactRow('Name', esc(lead.clientName))}
          ${lead.clientCompany ? contactRow('Company', esc(lead.clientCompany)) : ''}
          ${contactRow('Email', esc(lead.clientEmail))}
          ${lead.clientPhone ? contactRow('Phone', esc(lead.clientPhone)) : ''}
          ${lead.clientAddress ? contactRow('Address', esc(lead.clientAddress)) : ''}
          ${lead.clientLinkedin ? contactRow('LinkedIn', esc(lead.clientLinkedin)) : ''}
          ${lead.clientWebsite ? contactRow('Website', esc(lead.clientWebsite)) : ''}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Source -->
  <div style="padding:0 40px 28px 40px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:12px;color:rgba(255,255,255,0.35);">Source:</span>
      <span style="font-size:12px;color:rgba(255,255,255,0.7);font-weight:500;">${esc(sourceLabel)}</span>
      ${lead.sourceUrl ? `<span style="font-size:11px;color:rgba(255,255,255,0.3);word-break:break-all;">— ${esc(lead.sourceUrl)}</span>` : ''}
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
    <div style="font-size:11px;color:rgba(255,255,255,0.25);">Generated by AB Kreative — ${dateStr}</div>
  </div>

</div>
</body>
</html>`
}

export async function downloadLead(
  lead: Lead,
  format: 'pdf' | 'jpeg'
): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '800px'
  container.style.background = '#0A0A0A'
  container.style.zIndex = '-1'

  container.innerHTML = buildLeadHTML(lead)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#0A0A0A',
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const safeName = lead.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').slice(0, 80)

    if (format === 'jpeg') {
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${safeName}.jpeg`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        },
        'image/jpeg',
        0.95
      )
    } else {
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${safeName}.pdf`)
    }
  } finally {
    document.body.removeChild(container)
  }
}