'use client'

import { motion } from 'framer-motion'
import {
  Globe,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Search,
  PenTool,
  Hammer,
  CreditCard,
  Truck,
  ShieldCheck,
  Lightbulb,
  ChevronRight,
  Building2,
  FileText,
  DollarSign,
  User,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContactIcon {
  icon: React.ElementType
  label: string
}

interface PlatformSource {
  name: string
  url: string
  description: string
  searchTip?: string
}

interface CategoryData {
  id: string
  title: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  platforms: PlatformSource[]
  contactDetails: ContactIcon[]
  proTip: string
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const CATEGORIES: CategoryData[] = [
  {
    id: 'design',
    title: 'Design Leads',
    icon: PenTool,
    color: '#D9FA54',
    bgColor: 'rgba(217, 250, 84, 0.06)',
    borderColor: 'rgba(217, 250, 84, 0.15)',
    platforms: [
      { name: 'Behance', url: 'behance.net', description: 'Search "Hiring Designer" — look at project comments where companies post "looking for designer". Profiles often have email in bio.' },
      { name: 'Dribbble', url: 'dribbble.com/jobs', description: 'Official job board for designers. Application emails and company profiles visible on each listing.' },
      { name: 'Upwork', url: 'upwork.com', description: 'Search design projects. Client messages after proposal, project briefs show budget and contact requirements.' },
      { name: 'Fiverr', url: 'fiverr.com', description: 'Browse buyer requests. Buyer request details show name, brief description, and project scope.' },
      { name: 'LinkedIn', url: 'linkedin.com/jobs', description: 'Search "Interior Designer", "Graphic Designer", "Brand Designer". Filter by location worldwide. Send InMail to posters.', searchTip: 'Use LinkedIn Sales Navigator for advanced filtering by company size and recent posts.' },
      { name: 'Freelancer.com', url: 'freelancer.com', description: 'Design category projects. Project poster details become visible after bidding.' },
      { name: 'Architizer', url: 'architizer.com/firms', description: 'Architecture & design firms directory. Firm websites, emails, and project portfolios listed.' },
      { name: 'Houzz', url: 'houzz.com/professionals', description: 'Find homeowners posting projects in "Find a Pro". Homeowner requests include email for direct contact.' },
      { name: 'Clutch.co', url: 'clutch.co', description: 'B2B design agencies listed with full profiles — website, email, phone, client reviews, and hourly rates.' },
      { name: '99designs', url: '99designs.com', description: 'Contest briefs. Client info and project details visible to participating designers.' },
      { name: 'Coroflot', url: 'coroflot.com', description: 'Design job board with direct application links and employer profiles.' },
      { name: 'Awwwards', url: 'awwwards.com', description: 'Web design agencies directory with agency websites, team size, and contact details.' },
      { name: 'AD 100 / Architectural Digest', url: 'architecturaldigest.com', description: 'Lists top designers and firms worldwide. Firm websites and social profiles available.' },
      { name: 'DEXIGNER', url: 'dexigner.com', description: 'Design news with project credits. Firms and designers listed with links to their portfolios.' },
    ],
    contactDetails: [
      { icon: User, label: 'Name' },
      { icon: Mail, label: 'Email' },
      { icon: Phone, label: 'Phone (sometimes)' },
      { icon: Building2, label: 'Company' },
      { icon: Globe, label: 'Website' },
      { icon: Linkedin, label: 'LinkedIn Profile' },
      { icon: ExternalLink, label: 'Portfolio URL' },
      { icon: DollarSign, label: 'Project Budget (freelance platforms)' },
      { icon: MapPin, label: 'Registered Address' },
    ],
    proTip: 'On freelance platforms, don\'t just bid — research the client\'s company first. Check their website and LinkedIn to craft a personalized proposal. Companies posting on multiple platforms are hotter leads — they have budget approval and urgency.',
  },
  {
    id: 'fitout',
    title: 'Fitout Leads',
    icon: Hammer,
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.06)',
    borderColor: 'rgba(255, 107, 53, 0.15)',
    platforms: [
      { name: 'LinkedIn', url: 'linkedin.com/jobs', description: 'Search "Fitout Manager", "Interior Contractor", "MEP Engineer". Recruiter and company profiles visible.' },
      { name: 'Bayt.com', url: 'bayt.com', description: 'Middle East focused job board. Search "Fitout", "Interior" for company profiles and application emails.' },
      { name: 'GulfTalent', url: 'gulftalent.com', description: 'GCC job market platform. Employer details and direct application channels available.' },
      { name: 'Naukrigulf', url: 'naukrigulf.com', description: 'GCC jobs for construction/fitout roles. Recruiter info and company profiles visible.' },
      { name: 'Indeed', url: 'indeed.com', description: 'Search "fitout" worldwide. Company profiles with reviews, location, and direct contact options.' },
      { name: 'Construction.com', url: 'construction.com', description: 'Project leads database with project owner details, location, and project value.' },
      { name: 'Dodge Construction Network', url: 'construction.com', description: 'Construction project leads with general contractor info, project stage, and bid dates.' },
      { name: 'Procore', url: 'procore.com', description: 'Construction project management platform with public project bids and bidding contact info.' },
      { name: 'BIM Track', url: 'bimtrack.co', description: 'Construction collaboration platform. Project leads and stakeholder contacts available.' },
      { name: 'Buildozer / Mogul', url: 'buildozer.com', description: 'UAE construction project listings with developer and contractor details.', searchTip: 'Focus on projects in "planning" or "pre-construction" phase — these are the warmest leads for fitout contractors.' },
      { name: 'Dubai Municipality Portal', url: 'dm.gov.ae', description: 'Building permit applications are public records. Applicant details and project scope listed.' },
      { name: 'MEP Middle East', url: 'mepmiddleeast.com', description: 'Industry news with project announcements. Project contacts often included in articles.' },
      { name: 'Construction Week', url: 'constructionweekonline.com', description: 'Project news covering GCC construction. Companies mentioned are active buyers.' },
    ],
    contactDetails: [
      { icon: Building2, label: 'Company Name' },
      { icon: Phone, label: 'Phone' },
      { icon: Mail, label: 'Email' },
      { icon: MapPin, label: 'Project Location / Address' },
      { icon: DollarSign, label: 'Project Value' },
      { icon: User, label: 'Architect / Consultant Details' },
      { icon: Hammer, label: 'Main Contractor Details' },
    ],
    proTip: 'Monitor Dubai Municipality building permits weekly — new permits mean upcoming fitout work. Cross-reference permit applicants with LinkedIn to find the project manager. Projects in JAFZA, DIFC, and Business Bay have the highest fitout budgets.',
  },
  {
    id: 'finance',
    title: 'Credit Card & Finance Leads',
    icon: CreditCard,
    color: '#E5318A',
    bgColor: 'rgba(229, 49, 138, 0.06)',
    borderColor: 'rgba(229, 49, 138, 0.15)',
    platforms: [
      { name: 'MoneySuperMarket', url: 'moneysupermarket.com', description: 'Credit card comparison leads. User inquiry forms show product interest and financial profile.' },
      { name: 'NerdWallet', url: 'nerdwallet.com', description: 'Finance content with lead gen forms. User submissions include product preferences and financial data.' },
      { name: 'CreditCards.com', url: 'creditcards.com', description: 'Application inquiry leads from users comparing credit card offers.' },
      { name: 'Bankrate', url: 'bankrate.com', description: 'Financial product comparison leads with user intent signals and product preferences.' },
      { name: 'CompareCards', url: 'comparecards.com', description: 'Credit card comparison platform with user inquiry data and spending profiles.' },
      { name: 'Finder.com', url: 'finder.com', description: 'Financial comparison leads across credit cards, loans, and insurance products.' },
      { name: 'LinkedIn', url: 'linkedin.com/jobs', description: 'Search "Credit Card Sales", "Financial Advisor" for professional profiles and referral networks.' },
      { name: 'Indeed / Bayt', url: 'indeed.com', description: 'Search "Credit Card Analyst", "Loan Officer" for company profiles and team structures.', searchTip: 'Target job postings from banks actively hiring sales teams — they need leads and may partner with lead generators.' },
      { name: 'Reddit', url: 'reddit.com/r/CreditCards', description: 'r/CreditCards and r/personalfinance — users posting about credit card needs and comparison questions. Engage via DM or comments.' },
      { name: 'Facebook Groups', url: 'facebook.com', description: 'Groups like "Credit Card UAE", "Finance Tips". Members posting questions about credit products are warm leads.' },
      { name: 'Bank websites directly', url: 'emiratesnbd.com', description: 'Emirates NBD, ADCB, Mashreq, FAB careers pages for referral programs. Bank referral programs pay per approved application.' },
      { name: 'Credit Karma', url: 'creditkarma.com', description: 'Lead generation platform for financial products. Users actively seeking credit improvement and new cards.' },
      { name: 'LendingTree', url: 'lendingtree.com', description: 'Financial lead marketplace connecting borrowers with lenders. Real-time intent signals.' },
    ],
    contactDetails: [
      { icon: User, label: 'Name' },
      { icon: Mail, label: 'Email' },
      { icon: Phone, label: 'Phone' },
      { icon: DollarSign, label: 'Income Range' },
      { icon: Building2, label: 'Employment Type' },
      { icon: Globe, label: 'Current Bank' },
      { icon: MapPin, label: 'Location' },
      { icon: CreditCard, label: 'Desired Credit Limit' },
      { icon: FileText, label: 'Purpose (travel/cashback/business)' },
    ],
    proTip: 'Reddit and Facebook Groups are goldmines for finance leads — users self-qualify by posting specific questions. Build credibility by answering questions genuinely before pitching. In the UAE, bank referral programs (Emirates NBD, FAB) pay AED 300–800 per approved credit card application.',
  },
  {
    id: 'logistics',
    title: 'Logistics & Shipping Leads',
    icon: Truck,
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.06)',
    borderColor: 'rgba(6, 182, 212, 0.15)',
    platforms: [
      { name: 'Freightos', url: 'freightos.com', description: 'Freight marketplace. Shipper details become available after quote request is submitted.' },
      { name: 'Flexport', url: 'flexport.com', description: 'Logistics platform with shipment leads, trade lane data, and shipper profiles.' },
      { name: 'ShipBob', url: 'shipbob.com', description: 'E-commerce fulfillment leads from growing DTC brands needing 3PL services.' },
      { name: 'LogisticsIQ', url: 'logisticsiq.com', description: 'Supply chain leads database with decision-maker contacts and company profiles.' },
      { name: 'LinkedIn', url: 'linkedin.com/jobs', description: 'Search "Logistics Manager", "Supply Chain Director", "Freight Forwarder". Professional profiles with direct contact.' },
      { name: 'Indeed / Bayt / Naukrigulf', url: 'indeed.com', description: 'Search logistics roles in any region. Employer details and team structures visible.', searchTip: 'Companies hiring logistics roles are actively scaling operations — prime time to pitch your services as they need reliable partners.' },
      { name: 'SeaRates', url: 'searates.com', description: 'Shipping marketplace. Cargo owner details and route requirements visible on listings.' },
      { name: 'CargoX', url: 'cargox.com', description: 'Freight exchange platform connecting shippers with carriers. Route and cargo details available.' },
      { name: 'DAT', url: 'dat.com', description: 'Freight marketplace (US focused). Load postings with origin, destination, and contact info.' },
      { name: 'Uber Freight', url: 'uberfreight.com', description: 'Shipper leads from companies looking for carrier capacity and logistics solutions.' },
      { name: 'ProjectCargoNetwork', url: 'projectcargonetwork.com', description: 'Project cargo leads for oversized, heavy-lift, and specialized shipments.' },
      { name: 'The Loadstar', url: 'theloadstar.com', description: 'Logistics industry news. Company contacts mentioned in articles are decision-makers.' },
      { name: 'Logistics Middle East', url: 'logisticsmiddleeast.com', description: 'Regional logistics news with project announcements and company contacts.' },
      { name: 'Dubai Trade', url: 'dubaitrade.ae', description: 'Import/export data. Company import/export records reveal active traders and shipping volumes.' },
    ],
    contactDetails: [
      { icon: Building2, label: 'Company Name' },
      { icon: Mail, label: 'Email' },
      { icon: Phone, label: 'Phone' },
      { icon: MapPin, label: 'Shipper Address' },
      { icon: MapPin, label: 'Consignee Address' },
      { icon: FileText, label: 'Cargo Type' },
      { icon: Globe, label: 'Origin / Destination' },
      { icon: FileText, label: 'Weight / Volume' },
      { icon: Search, label: 'Frequency' },
      { icon: Truck, label: 'Current Logistics Provider' },
    ],
    proTip: 'Dubai Trade portal import/export records reveal companies with active shipping volumes — these are qualified leads because you already know they move freight. Cross-reference with LinkedIn to find the logistics manager. Companies importing from China to the UAE are the hottest logistics leads right now.',
  },
  {
    id: 'uae-approvals',
    title: 'UAE Government Approvals Leads',
    icon: ShieldCheck,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    platforms: [
      { name: 'Dubai Municipality', url: 'dm.gov.ae', description: 'Building permit applications and trade license applications. Applicant details on public records.' },
      { name: 'DCD Dubai', url: 'dcd.gov.ae', description: 'Civil Defense approval applications. Consultant and contractor details visible on each application.' },
      { name: 'DEWA', url: 'dewa.gov.ae', description: 'Electricity/water connection applications. Applicant details and project location listed.' },
      { name: 'Trakhees', url: 'trakhees.ae', description: 'Approval portal for JAFZA and other free zones. Company details and approval type visible.' },
      { name: 'Abu Dhabi Municipality', url: 'adm.gov.ae', description: 'Building permits for Abu Dhabi emirate. Project consultant details on record.' },
      { name: 'ESTIDAMA', url: 'estidama.ae', description: 'Pearl rating system applications. Project owner details and sustainability requirements listed.' },
      { name: 'Masdar', url: 'masdar.ae', description: 'Sustainable development projects with partner and contractor contact information.' },
      { name: 'Dubai Development Authority', url: 'dda.gov.ae', description: 'Development approvals for DMC and TECOM zones. Company and project details available.' },
      { name: 'Dubai Tourism', url: 'dubaicity.ae', description: 'Tourism license applications. Business type and applicant details visible.' },
      { name: 'Ministry of Economy', url: 'moe.gov.ae', description: 'Commercial license applications at federal level. Business activity and owner details.' },
      { name: 'DED Dubai', url: 'ded.gov.ae', description: 'Department of Economic Development — trade license records with business owner details.' },
      { name: 'SHJ Municipality', url: 'shjmunicipality.ae', description: 'Sharjah building permits and approvals. Contractor and consultant information listed.' },
      { name: 'Ajman Municipality', url: 'ajman.ae', description: 'Ajman building permits and zoning approvals. Applicant and project details on record.', searchTip: 'Ajman and Sharjah approvals are less competitive than Dubai — fewer consultants monitor them, meaning higher conversion rates for you.' },
      { name: 'Ras Al Khaimah Municipality', url: 'rak.ae', description: 'RAK approvals for building permits and development projects. Project owner details available.' },
      { name: 'UAE Government Services Portal', url: 'u.ae', description: 'Unified government services portal. Search across all emirates for license and permit applications.' },
      { name: 'Musanada', url: 'musanada.ae', description: 'Abu Dhabi government projects with tender details and contractor requirements.' },
      { name: 'TAMM', url: 'tamm.abudhabi.ae', description: 'Abu Dhabi government services portal. Building permits, licenses, and approval applications.' },
    ],
    contactDetails: [
      { icon: FileText, label: 'Trade License Number' },
      { icon: User, label: 'Owner Name' },
      { icon: Phone, label: 'Phone' },
      { icon: Mail, label: 'Email' },
      { icon: MapPin, label: 'Business Address' },
      { icon: Search, label: 'Activity Type' },
      { icon: User, label: 'Consultant Details' },
      { icon: Hammer, label: 'Contractor Details' },
      { icon: MapPin, label: 'Project Location (Plot Number)' },
      { icon: ShieldCheck, label: 'Approval Type' },
      { icon: Search, label: 'Current Status' },
    ],
    proTip: 'Government approval leads are the most qualified because they represent companies with confirmed budgets and regulatory obligations. Monitor DCD Dubai approvals daily — a new fire safety approval means the fitout is about to start. Pair this with Dubai Municipality permits to see the full project pipeline. Companies applying for ESTIDAMA Pearl ratings are high-value leads with sustainability budgets.',
  },
  {
    id: 'dubai-business-setup',
    title: 'Business Setup — Dubai Leads',
    icon: Building2,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    platforms: [
      { name: 'LinkedIn', url: 'linkedin.com', description: 'Search "setting up business in Dubai", "company formation UAE", "free zone setup". Filter by recent posts. Connect with founders, CEOs, and expansion managers posting about UAE market entry.', searchTip: 'Search: "looking to set up business in Dubai" OR "Dubai company formation" — filter by posts from last 30 days. These are hot leads actively planning UAE entry.' },
      { name: 'Dubai Chamber of Commerce', url: 'dubaichamber.com', description: 'Member directory with international companies registered in Dubai. Company details, contact info, and business activity listed.' },
      { name: 'DED Business Directory', url: 'ded.gov.ae', description: 'Department of Economic Development — trade license registry. Search by business activity, find newly registered companies.' },
      { name: 'Shutterstock / Google "Business Setup Dubai"', url: 'google.com', description: 'Companies running Google Ads for "business setup Dubai" are actively looking for setup services. Their landing pages show contact forms and phone numbers.' },
      { name: 'Free Zone Websites', url: 'dmcc.ae', description: 'DMCC, DIFC, JAFZA, Dubai Silicon Oasis, Dubai Airport Free Zone — each has an inquiry form and registered company directory with contacts.', searchTip: 'Check the "Partners" or "Registered Agents" pages on free zone websites — companies listed there are either active or recently completed setup.' },
      { name: 'UAE Government Services (u.ae)', url: 'u.ae', description: 'Official UAE digital government portal. Search for business license applications, investor visa applications, and company registration records.' },
      { name: 'Quora & Reddit (r/Dubai)', url: 'reddit.com/r/dubai', description: 'People asking "How to start a business in Dubai?" are warm leads. Answer their questions and offer direct consultation.' },
      { name: 'Expat Forums', url: 'expatwoman.com', description: 'Expat community forums where entrepreneurs discuss UAE business setup. Look for posts about company formation challenges.' },
      { name: 'Yelp / Google Business (Dubai)', url: 'google.com/maps', description: 'Search "business setup consultant Dubai" — find new companies recently listed with phone, website, and reviews.' },
      { name: 'Tradeling / B2B Platforms', url: 'tradeling.com', description: 'B2B marketplace where international companies list services. Companies posting about "expanding to UAE" or "Dubai office" are leads.' },
      { name: 'Facebook Groups', url: 'facebook.com', description: 'Search groups: "Business in Dubai", "Dubai Entrepreneurs", "UAE Business Setup". Members posting questions about licenses, visas, or office space are leads.', searchTip: 'Join 3-5 Dubai business Facebook groups. Set notifications to "All Posts". People asking about business costs, visa requirements, or best free zones are your warmest leads.' },
      { name: 'GulfTalent', url: 'gulftalent.com', description: 'Job postings for Dubai from international companies. A company hiring in Dubai is likely setting up or expanding operations.' },
      { name: 'Bayut / Property Finder', url: 'bayut.com', description: 'Companies searching for commercial office space in Dubai are often in the process of setting up their UAE presence.' },
      { name: 'Crunchbase', url: 'crunchbase.com', description: 'Search startups that recently raised funding and have "Dubai" or "UAE" in their profile. Funded startups are ready to set up operations.' },
      { name: 'AngelList / Wellfound', url: 'wellfound.com', description: 'Startups with Dubai offices hiring remote or local talent. New hires often need visa and business setup support.' },
    ],
    contactDetails: [
      { icon: User, label: 'Full Name' },
      { icon: Mail, label: 'Email' },
      { icon: Phone, label: 'Phone Number' },
      { icon: Building2, label: 'Current Company' },
      { icon: Globe, label: 'Website' },
      { icon: Linkedin, label: 'LinkedIn Profile' },
      { icon: MapPin, label: 'Current Location (Country)' },
      { icon: DollarSign, label: 'Budget Range (if mentioned)' },
      { icon: Search, label: 'Business Activity / Industry' },
      { icon: FileText, label: 'Desired License Type' },
    ],
    proTip: 'Dubai business setup leads are the highest-value because they come with a complete package: company formation + visa + bank account + PRO services = $3,000-$15,000+ per client. Monitor LinkedIn daily for "expanding to UAE" posts — these founders have budget approval and urgency. Pair with free zone inquiry forms to catch leads at the research phase. A founder asking "Which free zone is best for my e-commerce business?" is ready to sign.',
  },
]

const PRO_TIPS = [
  {
    title: 'Verify before you reach out',
    description: 'Cross-reference every lead across 2+ sources. A company posting on LinkedIn AND applying for a Municipality permit is a confirmed, budget-approved lead — not a cold prospect.',
  },
  {
    title: 'Lead with value, not a pitch',
    description: 'Reference something specific from their listing or project. "I saw your fitout permit for Plot JVT-2847 on Dubai Municipality — we handle DCD approvals for exactly this scope." Instant credibility.',
  },
  {
    title: 'Timing is everything',
    description: 'The best time to approach is when a lead is in the "decision" phase — after posting a job but before hiring. Set up Google Alerts and LinkedIn notifications for your target keywords to catch leads early.',
  },
  {
    title: 'Build a sourcing routine',
    description: 'Dedicate 30 minutes daily to scraping your top 3 platforms per category. Consistency beats intensity — 5 leads/day across 5 categories = 150+ qualified leads/month without paid tools.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadSourcesGuide() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#111111] px-3 py-1 text-xs font-medium text-muted-foreground">
            <Search className="h-3 w-3" />
            Lead Sourcing Playbook
          </div>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Where to find{' '}
            <span className="signal-text">genuine leads</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every lead starts with knowing where to look. This guide maps out the exact
            platforms, directories, and public records where real buyers post their needs
            — with specific search terms and the contact details you can extract from each source.
            No guesswork, no paid tools required.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10"
        >
          <Accordion type="multiple" className="space-y-3">
            {CATEGORIES.map((cat, catIndex) => {
              const CatIcon = cat.icon
              return (
                <AccordionItem
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl border border-border bg-[#111111] px-5 sm:px-6"
                >
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: cat.bgColor }}
                      >
                        <CatIcon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <div className="text-left">
                        <h3
                          className="text-base font-semibold text-foreground sm:text-lg"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          {cat.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {cat.platforms.length} verified sources
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    {/* Contact Details Available */}
                    <div className="mb-5">
                      <h4
                        className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        Contact details available
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.contactDetails.map((cd) => {
                          const CdIcon = cd.icon
                          return (
                            <span
                              key={cd.label}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              <CdIcon className="h-3 w-3" />
                              {cd.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {/* Platform List */}
                    <div className="mb-5">
                      <h4
                        className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        Platforms &amp; sources
                      </h4>
                      <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1 scrollbar-premium">
                        {cat.platforms.map((platform) => (
                          <div
                            key={platform.name}
                            className="group rounded-lg border border-border/50 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
                          >
                            <div className="flex items-start gap-2.5">
                              <ExternalLink
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                style={{ color: cat.color, opacity: 0.7 }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className="text-sm font-semibold text-foreground"
                                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                                  >
                                    {platform.name}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground/70">
                                    {platform.url}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                  {platform.description}
                                </p>
                                {platform.searchTip && (
                                  <div
                                    className="mt-2 flex items-start gap-1.5 rounded-md px-2 py-1.5"
                                    style={{
                                      backgroundColor: cat.bgColor,
                                    }}
                                  >
                                    <Lightbulb
                                      className="mt-0.5 h-3 w-3 shrink-0"
                                      style={{ color: cat.color }}
                                    />
                                    <span
                                      className="text-[11px] leading-relaxed"
                                      style={{ color: cat.color, opacity: 0.9 }}
                                    >
                                      {platform.searchTip}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category Pro Tip */}
                    <div
                      className="flex items-start gap-3 rounded-lg border p-3.5"
                      style={{
                        borderColor: cat.borderColor,
                        backgroundColor: cat.bgColor,
                      }}
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color: cat.color }} />
                      <div>
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: cat.color, fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          Pro Tip
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {cat.proTip}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </motion.div>

        {/* Bottom Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <h3
            className="mb-5 text-center text-lg font-semibold text-foreground sm:text-xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Lead verification &amp; outreach{' '}
            <span className="signal-text">best practices</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PRO_TIPS.map((tip, i) => (
              <div
                key={tip.title}
                className="rounded-xl border border-border bg-[#111111] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D9FA54]/10">
                    <Lightbulb className="h-4 w-4 text-[#D9FA54]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm font-semibold text-foreground"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {tip.title}
                      </h4>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}