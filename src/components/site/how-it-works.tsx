'use client'

import { motion } from 'framer-motion'
import {
  Search,
  Send,
  CheckCircle2,
  PenTool,
  Hammer,
  CreditCard,
  Truck,
  ShieldCheck,
} from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Browse leads',
    description:
      'Filter through active leads across five verticals and 10+ regions by category, country, budget, and timeline. Every lead is verified and includes full project brief and client information.',
  },
  {
    icon: Send,
    title: 'Connect directly',
    description:
      'Found a lead that fits your services? Access client contact details instantly. No middlemen, no commission — direct connections that close deals faster.',
  },
  {
    icon: CheckCircle2,
    title: 'Close the deal',
    description:
      'Engage clients on your terms with real budgets and real timelines. Build your pipeline and grow your business across international markets.',
  },
]

const CATEGORY_CARDS = [
  {
    icon: PenTool,
    name: 'Design',
    description: 'Interior, architectural, brand identity, graphic, 3D, web, and more.',
    color: '#D9FA54',
    bgColor: 'rgba(217, 250, 84, 0.06)',
    borderColor: 'rgba(217, 250, 84, 0.15)',
  },
  {
    icon: Hammer,
    name: 'Fitout',
    description: 'Office, retail, restaurant, villa renovation, MEP, and turnkey projects.',
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.06)',
    borderColor: 'rgba(255, 107, 53, 0.15)',
  },
  {
    icon: CreditCard,
    name: 'Finance',
    description: 'Credit card applications, business cards, and financial service leads.',
    color: '#E5318A',
    bgColor: 'rgba(229, 49, 138, 0.06)',
    borderColor: 'rgba(229, 49, 138, 0.15)',
  },
  {
    icon: Truck,
    name: 'Logistics',
    description: 'Freight forwarding, warehousing, cold chain, and last-mile delivery.',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.06)',
    borderColor: 'rgba(6, 182, 212, 0.15)',
  },
  {
    icon: ShieldCheck,
    name: 'UAE Approvals',
    description: 'Municipality, DCD, DEWA, Trakhees, and all government approvals.',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#111111] px-3 py-1 text-xs font-medium text-muted-foreground">
            How it works
          </div>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Three steps from lead to revenue
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            AB Kreative connects service providers with income-generating leads
            across five verticals and 10+ regions. Direct connections, real budgets.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-xl border border-border bg-[#111111] p-6"
              >
                <div className="absolute right-5 top-5 text-5xl font-bold text-muted-foreground/5">
                  0{i + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9FA54]/10">
                  <Icon className="h-6 w-6 text-[#D9FA54]" />
                </div>
                <h3
                  className="mt-4 text-lg font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Category cards */}
        <div className="mt-12">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Five verticals. One platform.
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORY_CARDS.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl border p-5"
                  style={{
                    borderColor: c.borderColor,
                    backgroundColor: c.bgColor,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: c.color }} />
                  <h4
                    className="mt-3 text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-space-grotesk)', color: c.color }}
                  >
                    {c.name}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}