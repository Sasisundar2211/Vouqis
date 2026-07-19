import { track } from '@/lib/analytics/track'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const pr = searchParams.get('pr') ?? ''
  const v = parseInt(searchParams.get('v') ?? '1', 10)

  // fire-and-forget: never block the pixel response
  track('package.viewed', { packageVersion: v, ...(pr ? { pr } : {}) }).catch(() => {})

  return new Response(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache',
    },
  })
}
