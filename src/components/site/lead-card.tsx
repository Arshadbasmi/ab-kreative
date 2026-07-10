'use client'

import { useSyncExternalStore } from 'react'
import { Flame, MapPin, Clock, DollarSign, Eye, Star, Briefcase, ArrowUpRight, Download, FileText, ImageIcon, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  type Lead,
  formatBudget,
  timeAgo,
  getCategoryMeta,
  getCountryFlag,
  getCountryName,
} from '@/lib/constants'
import { downloadLead } from '@/lib/download-lead'
import { isLeadPitchSent, subscribePitchSent } from '@/lib/pitch-status'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

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

export function LeadCard({
  lead,
  onClick,
  index = 0,
}: {
  lead: Lead
  onClick: () => void
  index?: number
}) {
  const cat = getCategoryMeta(lead.category)
  const catColor = getCatColorClass(lead.category)
  const skills = lead.skills.split(',').slice(0, 4)
  const extraSkills = lead.skills.split(',').length - 4
  const { toast } = useToast()
  const pitchSent = useSyncExternalStore(
    subscribePitchSent,
    () => lead.pitchStatus === 'SENT' || isLeadPitchSent(lead.id),
    () => false,
  )

  const handleDownload = async (format: 'pdf' | 'jpeg') => {
    toast({ title: `Generating ${format.toUpperCase()}...` })
    try {
      await downloadLead(lead, format)
      toast({ title: `${format.toUpperCase()} downloaded!` })
    } catch {
      toast({ title: 'Download failed', description: 'Could not generate file.', variant: 'destructive' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        onClick={onClick}
        className={`card-lift group relative cursor-pointer overflow-hidden border-border bg-[#111111] p-5 hover:${catColor.border}`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`gap-1 border ${catColor.border} ${catColor.bg} ${catColor.text} font-medium`}
            >
              {cat.short}
            </Badge>
            {lead.urgent && (
              <Badge
                variant="outline"
                className="gap-1 border-red-500/30 bg-red-500/10 font-medium text-red-400"
              >
                <Flame className="h-3 w-3" />
                Urgent
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
            {lead.featured && (
              <Badge
                variant="outline"
                className="gap-1 border-[#F59E0B]/30 bg-[#F59E0B]/10 font-medium text-[#F59E0B]"
              >
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground/40 transition-colors hover:border-border hover:text-[#D9FA54]"
                  aria-label="Download lead"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111111] border-border">
                <DropdownMenuItem
                  onClick={() => handleDownload('pdf')}
                  className="gap-2 text-foreground focus:bg-white/5 focus:text-foreground cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload('jpeg')}
                  className="gap-2 text-foreground focus:bg-white/5 focus:text-foreground cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" />
                  Download JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-[#D9FA54]" />
          </div>
        </div>

        {/* Title */}
        <h3
          className="mt-3 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-[#D9FA54]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {lead.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {lead.description}
        </p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s, i) => (
            <span
              key={i}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {s.trim()}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground/60">
              +{extraSkills}
            </span>
          )}
        </div>

        {/* Meta grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/80">
              {getCountryFlag(lead.country)} {lead.city || getCountryName(lead.country)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/80">{lead.timeline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 text-[#D9FA54]" />
            <span className="font-semibold text-[#D9FA54]">
              {formatBudget(lead.budgetMin, lead.budgetMax, lead.currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/80">
              {lead.subcategory || lead.experienceReq || 'Any level'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate">
            {lead.clientCompany || lead.clientName}
          </span>
          <div className="flex items-center gap-2">
            {lead.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {lead.views}
              </span>
            )}
            <span>{timeAgo(lead.createdAt)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
