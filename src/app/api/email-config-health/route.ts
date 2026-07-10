import { NextResponse } from 'next/server'
import { getConfiguredServerEmailRouteIds } from '@/lib/server-email-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    configuredRoutes: getConfiguredServerEmailRouteIds(),
  })
}
