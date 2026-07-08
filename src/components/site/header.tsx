'use client'

import { Mail, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({
  onPostLead,
  onEmailManagement,
}: {
  onPostLead: () => void
  onEmailManagement: () => void
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D9FA54]">
            <span
              className="text-sm font-bold text-[#0A0A0A]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              AB
            </span>
          </div>
          <div className="hidden sm:block">
            <div
              className="text-base font-semibold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              AB Kreative
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Lead Generation
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onEmailManagement}
            className="h-9 gap-1.5 border-border bg-[#111111] text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </Button>
          <Button
            onClick={onPostLead}
            className="h-9 gap-1.5 bg-[#D9FA54] text-[#0A0A0A] font-semibold hover:bg-[#D9FA54]/90"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post a Lead</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
