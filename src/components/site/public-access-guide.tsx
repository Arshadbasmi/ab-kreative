'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Copy, Check, Terminal, Wifi, ShieldCheck, Zap, MonitorSmartphone,
  ArrowRight, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Github,
  Cloud, Rocket, Database, Smartphone, Laptop, Download, Trash2, RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ---------- helpers ----------

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group mt-3">
      <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] border border-border p-3 pr-12 text-sm font-mono text-[#D9FA54] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-[#222] border border-border hover:bg-[#333] transition-colors"
        aria-label="Copy command"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#D9FA54] text-black text-sm font-bold shrink-0">
      {n}
    </span>
  )
}

// ---------- animation ----------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: 'easeOut' },
  }),
}

// ---------- main component ----------

export function PublicAccessGuide() {
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-12 md:py-20">
      {/* header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Deploy Your AB Kreative Site</h2>
        <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          Four steps to get your site live on Vercel with a cloud database.
        </p>
      </motion.div>

      {/* ─── Step 1 ─── */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <StepBadge n={1} />
          <h3 className="text-xl font-semibold">Download the Project</h3>
        </div>

        <Card className="border border-border bg-[#111111]">
          <CardContent className="p-5 flex flex-col items-center text-center gap-4">
            <a
              href="/api/download-project"
              className="inline-flex items-center gap-2 rounded-lg bg-[#D9FA54] px-6 py-3 font-semibold text-black text-base hover:brightness-110 transition-all"
            >
              <Download className="h-5 w-5" />
              Download ab-kreative.tar.gz
            </a>
            <p className="text-sm text-muted-foreground max-w-md">
              Double-click the downloaded file to extract. You'll get an <code className="text-[#D9FA54]">ab-kreative</code> folder.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Step 2 ─── */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <StepBadge n={2} />
          <h3 className="text-xl font-semibold">Push to GitHub</h3>
        </div>

        <Card className="border border-border bg-[#111111]">
          <CardContent className="p-5 space-y-5">
            <p className="text-sm text-muted-foreground">
              Open <strong className="text-foreground">Terminal</strong> — on Mac: press <kbd className="px-1.5 py-0.5 rounded bg-[#222] border border-border text-xs font-mono text-[#D9FA54]">Cmd+Space</kbd>, type <em>Terminal</em>, press Enter.
            </p>

            <div>
              <p className="text-xs text-muted-foreground mb-1">1. Navigate to the extracted folder</p>
              <CodeBlock code="cd ~/Desktop/ab-kreative" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">2. Initialize git and commit everything</p>
              <CodeBlock code="git init && git add -A && git commit -m &quot;deploy&quot;" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">3. Connect to your GitHub repo</p>
              <CodeBlock code="git remote add origin https://ArshadBasmi:YOUR_GITHUB_TOKEN@github.com/ArshadBasmi/ab-kreative.git" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">4. Push to GitHub</p>
              <CodeBlock code="git push -u origin main --force" />
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200 space-y-1">
              <p><strong className="text-amber-300">About YOUR_GITHUB_TOKEN:</strong> Create a GitHub Personal Access Token (classic) at <span className="text-amber-100 font-mono text-xs">github.com → Settings → Developer settings → Personal access tokens → Generate new token</span>. Check the <code className="text-[#D9FA54]">repo</code> checkbox.</p>
            </div>

            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200">
              <p><AlertTriangle className="inline h-4 w-4 mr-1 mb-0.5" />
                The <code className="text-rose-300">--force</code> flag will <strong>replace everything</strong> on GitHub with the new code. This fixes the missing <code className="text-rose-300">src/</code> folder issue.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Step 3 ─── */}
      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <StepBadge n={3} />
          <h3 className="text-xl font-semibold">Deploy to Vercel</h3>
        </div>

        <Card className="border border-border bg-[#111111]">
          <CardContent className="p-5 space-y-4 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1.5 text-foreground">
              <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#D9FA54] underline underline-offset-2 hover:brightness-110 transition">vercel.com</a></li>
              <li>Click the <strong>ab-kreative</strong> project</li>
              <li>Click <strong className="text-[#D9FA54]">Redeploy</strong></li>
            </ol>
            <p>That's it! Vercel will build and deploy your site automatically.</p>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-200">
              <p><strong className="text-blue-300">Troubleshooting:</strong> If you see a build error about a missing <code className="text-blue-300">src/</code> folder, make sure Step&nbsp;2 showed files being pushed (not &quot;Everything up-to-date&quot; without any new files).</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Step 4: Turso Cloud Database ─── */}
      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <StepBadge n={4} />
          <h3 className="text-xl font-semibold">Set Up Cloud Database <span className="text-sm font-normal text-muted-foreground">(Turso — free)</span></h3>
        </div>

        <Card className="border border-border bg-[#111111]">
          <CardContent className="p-5 space-y-5 text-sm text-muted-foreground">
            <p>Without this step, your Vercel site will show <strong className="text-foreground">0 leads</strong> (no database on Vercel). Turso gives you a free cloud database.</p>

            {/* 4a: Create Turso DB */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium text-foreground">4a. Create a Turso database</p>
              <ol className="list-decimal list-inside space-y-1 text-foreground/90">
                <li>Go to <a href="https://turso.tech" target="_blank" rel="noopener noreferrer" className="text-[#D9FA54] underline underline-offset-2 hover:brightness-110 transition">turso.tech</a> → Sign up (free)</li>
                <li>Go to <strong>Databases</strong> → <strong>Create Database</strong></li>
                <li>Name it <code className="text-[#D9FA54] font-mono text-xs">ab-kreative</code> → Select closest region (e.g. <code className="font-mono text-xs">eu-west-1</code>) → Create</li>
                <li>Click your new database → click <strong>"Generate Auth Token"</strong> → <strong>copy it</strong> (you'll only see it once!)</li>
                <li>Copy the <strong>Database URL</strong> shown at the top (looks like <code className="font-mono text-xs">libsql://ab-kreative-xxx.turso.io</code>)</li>
              </ol>
            </div>

            {/* 4b: Add env vars on Vercel */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium text-foreground">4b. Add env vars on Vercel</p>
              <ol className="list-decimal list-inside space-y-1 text-foreground/90">
                <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#D9FA54] underline underline-offset-2">vercel.com</a> → your <strong>ab-kreative</strong> project</li>
                <li>Go to <strong>Settings → Environment Variables</strong></li>
                <li>Add <code className="text-[#D9FA54] font-mono text-xs">TURSO_DATABASE_URL</code> = paste your Database URL</li>
                <li>Add <code className="text-[#D9FA54] font-mono text-xs">TURSO_AUTH_TOKEN</code> = paste your Auth Token</li>
                <li>Click <strong>Redeploy</strong> (Vercel needs to restart to pick up new env vars)</li>
              </ol>
            </div>

            {/* 4c: One-time setup URL */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium text-foreground">4c. Seed the database (one time only)</p>
              <p className="text-foreground/90">After Vercel redeploys, open this URL in your browser:</p>
              <div className="rounded-lg bg-[#1a1a1a] border border-border p-3 flex items-center gap-2">
                <code className="text-[#D9FA54] font-mono text-xs flex-1 break-all">ab-kreative.vercel.app/api/setup-db</code>
                <button
                  onClick={() => { navigator.clipboard.writeText('https://ab-kreative.vercel.app/api/setup-db') }}
                  className="shrink-0 p-1.5 rounded-md bg-[#222] border border-border hover:bg-[#333] transition-colors"
                  aria-label="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-foreground/90">You should see: <code className="text-emerald-400 font-mono text-xs">{"{ \"success\": true, \"count\": 37 }"}</code></p>
              <p>Then refresh your homepage — all <strong className="text-foreground">37 leads</strong> will appear!</p>
            </div>

            <div className="rounded-lg border border-border bg-[#1a1a1a] p-3 text-sm">
              <p className="text-muted-foreground">
                <ShieldCheck className="inline h-4 w-4 mr-1 mb-0.5 text-[#D9FA54]" />
                <strong className="text-foreground">Health check:</strong> Visit <code className="text-[#D9FA54] font-mono text-xs">your-url.com/api/db-health</code> to verify the database connection.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}