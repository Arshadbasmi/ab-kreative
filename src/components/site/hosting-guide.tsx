'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Globe,
  Shield,
  Mail,
  Terminal,
  Settings,
  Database,
  Lock,
  MonitorSmartphone,
  Cloud,
  Copy,
  Check,
  ChevronRight,
  Cpu,
  HardDrive,
  Wifi,
  UserCheck,
  FolderGit2,
  Package,
  FileCode,
  Code,
  Rocket,
  Play,
  RefreshCw,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/*  Code Block with Copy                                               */
/* ------------------------------------------------------------------ */

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="group relative rounded-lg border border-border bg-[#0A0A0A]">
      {language && (
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {language}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-xs leading-relaxed text-muted-foreground">
          {code}
        </code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-7 gap-1.5 rounded-md border border-border bg-[#111111] px-2 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:bg-[#1a1a1a] hover:text-foreground group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-[#D9FA54]" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */

function GuideSection({
  number,
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  number: number
  title: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay }}
      className="border-t border-border pt-10 first:border-t-0 first:pt-0"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9FA54]">
          <span className="text-sm font-bold text-[#0A0A0A]">{number}</span>
        </div>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-[#D9FA54]" />
          <h3
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {title}
          </h3>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline Step (numbered within a section)                            */
/* ------------------------------------------------------------------ */

function Step({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D9FA54]/30 bg-[#D9FA54]/10">
          <span className="text-xs font-semibold text-[#D9FA54]">{step}</span>
        </div>
        <div className="mt-1.5 w-px flex-1 bg-border" />
      </div>
      <div className="pb-6">
        <h4
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </h4>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Prerequisite Item                                                  */
/* ------------------------------------------------------------------ */

function PrereqItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType
  text: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-[#111111] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D9FA54]/10">
        <Icon className="h-4 w-4 text-[#D9FA54]" />
      </div>
      <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  VPS Card                                                           */
/* ------------------------------------------------------------------ */

function VpsCard({
  name,
  price,
  specs,
  note,
  icon: Icon,
  delay,
}: {
  name: string
  price: string
  specs: string
  note: string
  icon: React.ElementType
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-[#111111] p-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D9FA54]/10">
          <Icon className="h-5 w-5 text-[#D9FA54]" />
        </div>
        <div>
          <h4
            className="font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {name}
          </h4>
          <span className="text-xs text-[#D9FA54] font-medium">{price}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{specs}</p>
      <p className="mt-1 text-xs text-muted-foreground/60">{note}</p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function HostingGuide() {
  return (
    <section className="border-t border-border bg-[#0A0A0A]">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#111111] px-3 py-1 text-xs font-medium text-muted-foreground">
            <Terminal className="h-3 w-3" />
            Deployment Guide
          </div>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Host on{' '}
            <span className="signal-text">your own system</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Step-by-step instructions to deploy AB Kreative on your own
            server, VPS, or local machine.
          </p>
        </motion.div>

        {/* ─── Guide Content ─── */}
        <div className="mt-12 space-y-0">
          {/* ── Section 1: Prerequisites ── */}
          <GuideSection
            number={1}
            title="Prerequisites"
            icon={MonitorSmartphone}
            delay={0}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Make sure you have the following before you start:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PrereqItem
                icon={Server}
                text="Ubuntu 22.04/24.04 LTS (recommended) or any Linux / Mac / Windows machine"
              />
              <PrereqItem
                icon={Cpu}
                text="Minimum 2 GB RAM, 20 GB disk space"
              />
              <PrereqItem
                icon={FolderGit2}
                text="Node.js 18+ or Bun runtime installed"
              />
              <PrereqItem
                icon={Globe}
                text="A domain name (optional, for production use)"
              />
              <PrereqItem
                icon={UserCheck}
                text="Basic terminal / SSH knowledge"
              />
              <PrereqItem
                icon={HardDrive}
                text="Git for version control"
              />
            </div>
          </GuideSection>

          {/* ── Section 2: Local Development Setup ── */}
          <GuideSection
            number={2}
            title="Local Development Setup"
            icon={Code}
            delay={0.05}
          >
            <p className="mb-5 text-sm text-muted-foreground">
              Get the app running locally in a few minutes:
            </p>

            <Step step={1} title="Clone the project">
              <CodeBlock
                code={`git clone <your-repo-url> && cd ab-kreative`}
                language="bash"
              />
            </Step>

            <Step step={2} title="Install dependencies">
              <CodeBlock
                code={`bun install`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground/60">
                Or use <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">npm install</code> if you prefer npm.
              </p>
            </Step>

            <Step step={3} title="Set up environment variables">
              <CodeBlock
                code={`cp .env.example .env`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Open <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">.env</code> and configure:
              </p>
              <CodeBlock
                code={`DATABASE_URL="file:./db/custom.db"`}
                language="env"
              />
            </Step>

            <Step step={4} title="Push database schema">
              <CodeBlock
                code={`bun run db:push`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground/60">
                This creates the SQLite database and applies the Prisma schema.
              </p>
            </Step>

            <Step step={5} title="Optional: seed sample data">
              <CodeBlock
                code={`bun run scripts/seed.ts`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground/60">
                Only use this for demos or testing. Skip it when you want the app to show real verified leads only.
              </p>
            </Step>

            <Step step={6} title="Start the dev server">
              <CodeBlock
                code={`bun run dev`}
                language="bash"
              />
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#D9FA54]/20 bg-[#D9FA54]/5 px-3 py-2">
                <Rocket className="h-4 w-4 shrink-0 text-[#D9FA54]" />
                <p className="text-xs text-foreground">
                  App runs at{' '}
                  <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">
                    http://localhost:3000
                  </code>
                </p>
              </div>
            </Step>
          </GuideSection>

          {/* ── Section 3: Production Build & Self-Hosting ── */}
          <GuideSection
            number={3}
            title="Production Build & Self-Hosting"
            icon={Rocket}
            delay={0.1}
          >
            <p className="mb-5 text-sm text-muted-foreground">
              Build a self-contained production server:
            </p>

            <Step step={1} title="Build the application">
              <CodeBlock
                code={`bun run build`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                This creates <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">.next/standalone/</code> — a self-contained Node.js server that includes all dependencies.
              </p>
            </Step>

            <Step step={2} title="Configure environment for production">
              <p className="mb-2 text-xs text-muted-foreground">
                Create a <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">.env.production</code> file:
              </p>
              <CodeBlock
                code={`DATABASE_URL="file:./db/custom.db"\nNODE_ENV="production"`}
                language="env"
              />
            </Step>

            <Step step={3} title="Start the production server">
              <p className="mb-2 text-xs text-muted-foreground">
                With Bun:
              </p>
              <CodeBlock
                code={`PORT=3000 bun run start`}
                language="bash"
              />
              <p className="my-2 text-xs text-muted-foreground">
                Or with Node directly:
              </p>
              <CodeBlock
                code={`NODE_ENV=production node .next/standalone/server.js`}
                language="bash"
              />
            </Step>

            <Step step={4} title="Run in background with PM2">
              <p className="mb-2 text-xs text-muted-foreground">
                PM2 keeps your app running and auto-restarts on crashes.
              </p>
              <CodeBlock
                code={`# Install PM2 globally\nnpm install -g pm2\n\n# Start the app\npm2 start .next/standalone/server.js --name ab-kreative\n\n# Save the process list\npm2 save\n\n# Set up PM2 to start on boot\npm2 startup`}
                language="bash"
              />
            </Step>
          </GuideSection>

          {/* ── Section 4: Reverse Proxy with Nginx ── */}
          <GuideSection
            number={4}
            title="Reverse Proxy with Nginx"
            icon={Globe}
            delay={0.15}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Nginx sits in front of your app, handling HTTP traffic and forwarding
              requests to the Node.js server. This is recommended for production.
            </p>

            <Step step={1} title="Install Nginx">
              <CodeBlock
                code={`sudo apt update && sudo apt install nginx -y`}
                language="bash"
              />
            </Step>

            <Step step={2} title="Create site configuration">
              <CodeBlock
                code={`sudo nano /etc/nginx/sites-available/ab-kreative`}
                language="bash"
              />
            </Step>

            <Step step={3} title="Paste the Nginx config">
              <p className="mb-2 text-xs text-muted-foreground">
                Use the following configuration (replace{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">yourdomain.com</code> with
                your actual domain or IP):
              </p>
              <CodeBlock
                code={`server {\n    listen 80;\n    server_name yourdomain.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_cache_bypass $http_upgrade;\n    }\n}`}
                language="nginx"
              />
            </Step>

            <Step step={4} title="Enable the site and restart Nginx">
              <CodeBlock
                code={`# Create symlink to enable the site\nsudo ln -s /etc/nginx/sites-available/ab-kreative /etc/nginx/sites-enabled/\n\n# Test the configuration\nsudo nginx -t\n\n# Restart Nginx\nsudo systemctl restart nginx`}
                language="bash"
              />
            </Step>
          </GuideSection>

          {/* ── Section 5: SSL/HTTPS with Let's Encrypt ── */}
          <GuideSection
            number={5}
            title="SSL / HTTPS with Let's Encrypt"
            icon={Lock}
            delay={0.2}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Secure your site with a free SSL certificate from Let's Encrypt.
              Certbot handles everything automatically, including renewal.
            </p>

            <Step step={1} title="Install Certbot">
              <CodeBlock
                code={`sudo apt install certbot python3-certbot-nginx -y`}
                language="bash"
              />
            </Step>

            <Step step={2} title="Get your SSL certificate">
              <CodeBlock
                code={`sudo certbot --nginx -d yourdomain.com`}
                language="bash"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Certbot will modify your Nginx config automatically to serve
                over HTTPS. Follow the interactive prompts.
              </p>
            </Step>

            <Step step={3} title="Verify auto-renewal">
              <CodeBlock
                code={`# Test the renewal process (dry run)\nsudo certbot renew --dry-run`}
                language="bash"
              />
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#D9FA54]/20 bg-[#D9FA54]/5 px-3 py-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#D9FA54]" />
                <p className="text-xs text-foreground">
                  Certbot automatically adds a cron job for renewal. No manual
                  action needed.
                </p>
              </div>
            </Step>
          </GuideSection>

          {/* ── Section 6: Email Integration ── */}
          <GuideSection
            number={6}
            title="Email Integration"
            icon={Mail}
            delay={0.25}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Set up Nodemailer to send lead notification emails when new leads
              are posted. Works with any SMTP provider.
            </p>

            <Step step={1} title="Install Nodemailer">
              <CodeBlock
                code={`bun add nodemailer`}
                language="bash"
              />
            </Step>

            <Step step={2} title="Add environment variables">
              <p className="mb-2 text-xs text-muted-foreground">
                Add these to your <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">.env</code> file:
              </p>
              <CodeBlock
                code={`SMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your-email@gmail.com\nSMTP_PASS=your-app-password\nSMTP_FROM="AB Kreative <noreply@yourdomain.com>"`}
                language="env"
              />
            </Step>

            <Step step={3} title="Enable the notification route">
              <p className="text-sm text-muted-foreground">
                Uncomment the Nodemailer code in{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[#D9FA54]">
                  /src/app/api/leads/notify/route.ts
                </code>{' '}
                to activate email notifications when new leads are submitted.
              </p>
            </Step>

            <Step step={4} title="Compatible providers">
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { name: 'Gmail SMTP', note: 'Free, use App Passwords' },
                  { name: 'SendGrid', note: 'Free tier: 100 emails/day' },
                  { name: 'Resend', note: 'Developer-friendly, free tier' },
                  { name: 'Mailgun', note: 'Reliable, good API' },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 rounded-lg border border-border bg-[#111111] px-3 py-2.5"
                  >
                    <Send className="h-3.5 w-3.5 shrink-0 text-[#D9FA54]" />
                    <div>
                      <span className="text-xs font-medium text-foreground">
                        {p.name}
                      </span>
                      <span className="ml-2 text-[10px] text-muted-foreground/60">
                        {p.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Step>
          </GuideSection>

          {/* ── Section 7: Cloud VPS Hosting Options ── */}
          <GuideSection
            number={7}
            title="Cloud VPS Hosting Options"
            icon={Cloud}
            delay={0.3}
          >
            <p className="mb-5 text-sm text-muted-foreground">
              If you don't have a server, here are recommended VPS providers
              that work great for hosting AB Kreative:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <VpsCard
                name="DigitalOcean"
                price="$4–6/month"
                specs="1 GB RAM droplet, simple setup with one-click deploys"
                note="Best for beginners, extensive docs"
                icon={Globe}
                delay={0}
              />
              <VpsCard
                name="Hetzner"
                price="€3.29/month"
                specs="2 GB RAM, excellent performance per dollar"
                note="Great value, data centers in Europe"
                icon={Server}
                delay={0.05}
              />
              <VpsCard
                name="Vultr"
                price="$2.50–6/month"
                specs="Global locations including Dubai, flexible plans"
                note="Good for Middle East / Asia regions"
                icon={Cloud}
                delay={0.1}
              />
            </div>
          </GuideSection>

          {/* ── Section 8: Maintenance ── */}
          <GuideSection
            number={8}
            title="Maintenance"
            icon={Settings}
            delay={0.35}
          >
            <p className="mb-5 text-sm text-muted-foreground">
              Day-to-day commands to keep your deployment healthy:
            </p>

            <div className="space-y-4">
              {/* Updates */}
              <div className="rounded-xl border border-border bg-[#111111] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D9FA54]/10">
                    <RefreshCw className="h-4 w-4 text-[#D9FA54]" />
                  </div>
                  <h4
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Update the app
                  </h4>
                </div>
                <CodeBlock
                  code={`git pull && bun install && bun run build && pm2 restart ab-kreative`}
                  language="bash"
                />
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Pulls latest code, installs dependencies, rebuilds, and restarts the PM2 process.
                </p>
              </div>

              {/* Database Backup */}
              <div className="rounded-xl border border-border bg-[#111111] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D9FA54]/10">
                    <Database className="h-4 w-4 text-[#D9FA54]" />
                  </div>
                  <h4
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Database backup
                  </h4>
                </div>
                <CodeBlock
                  code={`mkdir -p backups\ncp db/custom.db backups/backup-$(date +%Y%m%d).db`}
                  language="bash"
                />
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Creates a timestamped backup. Add to cron for daily backups.
                </p>
              </div>

              {/* Logs */}
              <div className="rounded-xl border border-border bg-[#111111] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D9FA54]/10">
                    <Terminal className="h-4 w-4 text-[#D9FA54]" />
                  </div>
                  <h4
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    View logs
                  </h4>
                </div>
                <CodeBlock
                  code={`# Real-time logs\npm2 logs ab-kreative\n\n# Last 100 lines\npm2 logs ab-kreative --lines 100`}
                  language="bash"
                />
              </div>

              {/* Monitoring */}
              <div className="rounded-xl border border-border bg-[#111111] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D9FA54]/10">
                    <MonitorSmartphone className="h-4 w-4 text-[#D9FA54]" />
                  </div>
                  <h4
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Live monitoring
                  </h4>
                </div>
                <CodeBlock
                  code={`pm2 monit`}
                  language="bash"
                />
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Opens a real-time terminal dashboard with CPU, memory, and logs.
                </p>
              </div>
            </div>
          </GuideSection>
        </div>

        {/* ─── Footer CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 flex flex-col items-center rounded-xl border border-border bg-[#111111] p-6 text-center sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D9FA54]">
            <ChevronRight className="h-6 w-6 text-[#0A0A0A]" />
          </div>
          <h3
            className="mt-4 text-lg font-bold text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Ready to deploy?
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Follow sections 1–5 in order for a complete production deployment.
            Add email notifications (section 6) when you're ready.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {['Prerequisites', 'Build', 'Nginx', 'SSL', 'Email'].map(
              (label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-[#0A0A0A] px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                >
                  <span className="text-[#D9FA54]">{i + 1}</span>
                  {label}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
