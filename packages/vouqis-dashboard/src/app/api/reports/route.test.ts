import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockSubSelect = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: (_url: string, key: string) => {
    if (key === 'test-service-key') {
      return {
        from: (table: string) => {
          if (table === 'subscriptions') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: mockSubSelect,
                  }),
                }),
              }),
            }
          }
          // audit_reports: insert(payload).select('id').single()
          return {
            insert: (payload: unknown) => {
              mockInsert(payload)
              return {
                select: () => ({
                  single: () => ({ data: { id: 'abc12345' }, error: null }),
                }),
              }
            },
          }
        },
      }
    }
    return { from: () => ({ insert: mockInsert }) }
  },
}))

describe('/api/reports — expires_at', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
    process.env.NEXT_PUBLIC_FREE_REPORT_EXPIRY_DAYS = '30'
    process.env.NEXT_PUBLIC_PRO_REPORT_HISTORY_DAYS = '90'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockInsert.mockClear()
    mockSubSelect.mockClear()
  })

  it('sets 90d expiry when valid Pro api_key is provided', async () => {
    mockSubSelect.mockResolvedValue({
      data: { status: 'active', api_key: 'validkey123' },
      error: null,
    })
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vouqis-Api-Key': 'validkey123',
      },
      body: JSON.stringify({
        serverUrl: 'http://test.example.com',
        trustScore: 75,
        verdict: 'RISKY',
        passCount: 7,
        failCount: 3,
        latencyP50: 400,
        topFailures: [],
        probeResults: [],
      }),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(200)
    const insertCall = mockInsert.mock.calls[0][0]
    const expiresAt = new Date(insertCall.expires_at)
    const daysFromNow = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    expect(daysFromNow).toBeGreaterThan(88)
    expect(daysFromNow).toBeLessThan(92)
  })

  it('sets 30d expiry when no api_key header is present', async () => {
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serverUrl: 'http://test.example.com',
        trustScore: 75,
        verdict: 'RISKY',
        passCount: 7,
        failCount: 3,
        latencyP50: 400,
        topFailures: [],
        probeResults: [],
      }),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(200)
    const insertCall = mockInsert.mock.calls[0][0]
    const expiresAt = new Date(insertCall.expires_at)
    const daysFromNow = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    expect(daysFromNow).toBeGreaterThan(28)
    expect(daysFromNow).toBeLessThan(32)
  })
})
