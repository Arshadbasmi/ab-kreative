'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { BrowseLeadsView } from '@/components/site/browse-leads-view'
import { HowItWorks } from '@/components/site/how-it-works'
import { LeadSourcesGuide } from '@/components/site/lead-sources-guide'
import { HostingGuide } from '@/components/site/hosting-guide'
import { PublicAccessGuide } from '@/components/site/public-access-guide'
import { Footer } from '@/components/site/footer'
import { PostLeadDialog } from '@/components/site/post-lead-dialog'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Home() {
  const [postLeadOpen, setPostLeadOpen] = useState(false)

  const { data: analytics } = useSWR<{
    totals: {
      totalLeads: number
      totalPipelineValue: number
    }
    leadsByCategory: Array<{ category: string; count: number }>
    leadsByRegion: Array<{ region: string; count: number }>
  }>('/api/analytics', fetcher, {
    revalidateOnFocus: false,
    fallbackData: {
      totals: { totalLeads: 0, totalPipelineValue: 0 },
      leadsByCategory: [],
      leadsByRegion: [],
    },
  })

  const handleBrowse = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById('leads-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const handlePostLead = useCallback(() => {
    setPostLeadOpen(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onPostLead={handlePostLead} />

      <main className="flex-1">
        <Hero
          totalLeads={analytics?.totals.totalLeads ?? 0}
          totalPipelineValue={analytics?.totals.totalPipelineValue ?? 0}
          leadsByCategory={analytics?.leadsByCategory ?? []}
          leadsByRegion={analytics?.leadsByRegion ?? []}
          onBrowse={handleBrowse}
          onPostLead={handlePostLead}
        />

        <div id="leads-section">
          <BrowseLeadsView />
        </div>

        <HowItWorks />
        <LeadSourcesGuide />
        <PublicAccessGuide />
        <HostingGuide />
      </main>

      <Footer />

      <PostLeadDialog
        open={postLeadOpen}
        onClose={() => setPostLeadOpen(false)}
        onSubmitted={() => {
          // SWR will auto-revalidate
        }}
      />
    </div>
  )
}