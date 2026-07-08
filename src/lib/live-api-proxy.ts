import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LIVE_ORIGIN = 'https://ab-kreative.vercel.app'

export function shouldProxyToLiveApi(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.LOCAL_LIVE_API_PROXY !== 'disabled' &&
    !process.env.TURSO_DATABASE_URL
  )
}

export async function proxyToLiveApi(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> {
  const incomingUrl = new URL(request.url)
  const liveUrl = new URL(pathname, process.env.LIVE_API_ORIGIN || DEFAULT_LIVE_ORIGIN)
  liveUrl.search = incomingUrl.search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')
  headers.delete('accept-encoding')
  headers.set('x-ab-kreative-local-proxy', '1')

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text()
  }

  try {
    const response = await fetch(liveUrl.toString(), init)
    const body = await response.text()
    const responseHeaders = new Headers()
    const contentType = response.headers.get('content-type')

    if (contentType) {
      responseHeaders.set('content-type', contentType)
    }

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Live API proxy failed',
        details: String(error),
      },
      { status: 502 },
    )
  }
}
