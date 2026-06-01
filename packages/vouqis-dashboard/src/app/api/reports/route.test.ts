import {describe, it, expect, vi, beforeEach} from 'vitest'

const mockInsert = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: (payload: unknown) => {
        mockInsert(payload)
        return {
          select: () => ({
            single: () => ({data: {id: 'abc12345'}, error: null}),
          }),
        }
      },
    }),
  }),
}))

vi.mock('@/lib/email', () => ({
  sendFounderAlert: vi.fn().mockResolvedValue(undefined),
}))

describe('/api/reports', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockInsert.mockClear()
  })

  it('returns 400 when required fields are missing', async () => {
    const {POST} = await import('./route')
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({trustScore: 75}),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(400)
  })

  it('always inserts with 7-day expiry — no Pro tier', async () => {
    const {POST} = await import('./route')
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vouqis-Api-Key': 'some-key',
      },
      body: JSON.stringify({
        serverUrl: 'http://test.example.com',
        trustScore: 75,
        verdict: 'RISKY',
        passCount: 7,
        failCount: 3,
        latencyP50: 400,
        topFailures: {},
        probeResults: [],
      }),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(200)
    const insertCall = mockInsert.mock.calls[0][0]
    const daysFromNow = (new Date(insertCall.expires_at).getTime() - Date.now()) / 86_400_000
    expect(daysFromNow).toBeGreaterThan(6)
    expect(daysFromNow).toBeLessThan(8)
    expect(insertCall.user_api_key).toBeNull()
  })

  it('returns id and reportUrl in the response body', async () => {
    const {POST} = await import('./route')
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        serverUrl: 'http://test.example.com',
        trustScore: 80,
        verdict: 'APPROVED',
        passCount: 10,
        failCount: 0,
        latencyP50: 200,
        topFailures: {},
        probeResults: [],
      }),
    })
    const response = await POST(request as never)
    const json = (await response.json()) as {id: string; reportUrl: string}
    expect(json.id).toBe('abc12345')
    expect(json.reportUrl).toContain('abc12345')
  })
})
