import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET /api/download-project — Returns a pre-generated tar.gz of the project
export async function GET() {
  try {
    // Try pre-generated file first (most reliable)
    const preGenerated = '/tmp/ab-kreative.tar.gz'
    if (fs.existsSync(preGenerated)) {
      const fileBuffer = fs.readFileSync(preGenerated)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': 'attachment; filename="ab-kreative.tar.gz"',
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    }

    // Fallback: look for the tarball in the project root
    const projectRoot = path.resolve(process.cwd())
    const fallback = path.join(projectRoot, 'ab-kreative.tar.gz')
    if (fs.existsSync(fallback)) {
      const fileBuffer = fs.readFileSync(fallback)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': 'attachment; filename="ab-kreative.tar.gz"',
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    }

    return NextResponse.json(
      { error: 'Download file not found. Please regenerate the tarball.' },
      { status: 404 },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Download error:', msg)
    return NextResponse.json({ error: 'Failed to serve download' }, { status: 500 })
  }
}