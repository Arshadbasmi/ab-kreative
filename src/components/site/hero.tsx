'use client'

import { ArrowRight, TrendingUp, Layers, Globe, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { getTotalCategories } from '@/lib/constants'

const KEY_EMIRATES = [
  { code: 'global-design', name: 'Design worldwide', flag: '🌐' },
  { code: 'dubai', name: 'Dubai', flag: '🇦🇪' },
  { code: 'abu-dhabi', name: 'Abu Dhabi', flag: '🇦🇪' },
  { code: 'sharjah', name: 'Sharjah', flag: '🇦🇪' },
  { code: 'ajman', name: 'Ajman', flag: '🇦🇪' },
  { code: 'uae-services', name: 'UAE services', flag: '🇦🇪' },
]

export function Hero({
  totalLeads,
  totalPipelineValue,
  leadsByCategory,
  leadsByRegion,
  onBrowse,
  onPostLead,
}: {
  totalLeads: number
  totalPipelineValue: number
  leadsByCategory: Array<{ category: string; count: number }>
  leadsByRegion: Array<{ region: string; count: number }>
  onBrowse: () => void
  onPostLead: () => void
}) {
  const pipelineK = Math.round(totalPipelineValue / 1000)

  const stats = [
    {
      label: 'Total leads',
      value: totalLeads.toString(),
      icon: TrendingUp,
    },
    {
      label: 'Categories',
      value: getTotalCategories().toString(),
      icon: Layers,
    },
    {
      label: 'Market scope',
      value: 'Global + UAE',
      icon: Globe,
    },
    {
      label: 'Pipeline value',
      value: `$${pipelineK}K+`,
      icon: DollarSign,
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border grid-pattern">
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          {/* Live tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#111111] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Design worldwide. Key services UAE-first.
          </div>

          {/* Headline */}
          <h1
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Income-generating leads from{' '}
            <span className="signal-text">global design and UAE service markets</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AB Kreative sources design opportunities worldwide, while fitout,
            advertising, credit card, loan, and logistics leads stay focused on
            the UAE. Dropshipping product sourcing finds current market winners
            and supplier contacts.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onBrowse}
              className="gap-2 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
            >
              Browse leads
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onPostLead}
              className="gap-2 border-[#D9FA54]/40 text-[#D9FA54] hover:bg-[#D9FA54]/10 hover:text-[#D9FA54]"
            >
              Post a lead
            </Button>
          </div>

          {/* Region chips */}
          <div className="mt-8 flex flex-wrap items-center gap-1.5">
            {KEY_EMIRATES.map((c) => (
              <span
                key={c.code}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#111111]/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                <span className="text-sm leading-none">{c.flag}</span>
                {c.name}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-border bg-[#111111]/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              +UAE free zones
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-[#111111] p-4 sm:p-5"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div
                  className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {s.label}
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
