'use client'

import { Linkedin, Twitter } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

const KEY_REGIONS = [
  { name: 'Design Worldwide', flag: '🌐' },
  { name: 'Dubai', flag: '🇦🇪' },
  { name: 'Abu Dhabi', flag: '🇦🇪' },
  { name: 'Sharjah', flag: '🇦🇪' },
  { name: 'Fitout UAE', flag: '🇦🇪' },
  { name: 'Advertising UAE', flag: '🇦🇪' },
  { name: 'Credit Card UAE', flag: '🇦🇪' },
  { name: 'Logistics UAE', flag: '🇦🇪' },
  { name: 'UAE Free Zones', flag: '🇦🇪' },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D9FA54]">
                <span
                  className="text-sm font-bold text-[#0A0A0A]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  AB
                </span>
              </div>
              <div>
                <div
                  className="text-base font-semibold tracking-tight text-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  AB Kreative
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Lead Generation
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Income-generating leads across key verticals: design worldwide,
              plus UAE-focused fitout, advertising, credit card, logistics,
              and approvals. Direct connections, real budgets.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[#111111] text-muted-foreground transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[#111111] text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter / X"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Lead Categories */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Lead Categories
            </h4>
            <ul className="mt-3 space-y-1.5 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.code}>
                  <span className="text-muted-foreground transition-colors hover:text-foreground">
                    {c.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Market Focus
            </h4>
            <ul className="mt-3 space-y-1.5 text-sm">
              {KEY_REGIONS.map((r) => (
                <li key={r.name}>
                  <span className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <span>{r.flag}</span>
                    {r.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2025 AB Kreative. Designing Future Realities.</p>
          <div className="flex items-center gap-4">
            <span className="transition-colors hover:text-foreground">Privacy</span>
            <span className="transition-colors hover:text-foreground">Terms</span>
            <span className="transition-colors hover:text-foreground">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
