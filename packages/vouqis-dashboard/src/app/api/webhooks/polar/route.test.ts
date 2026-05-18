import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockUpsert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      upsert: mockUpsert,
    }),
  }),
}))

// Mock Resend email
vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

// Mock Polar validateEvent
vi.mock('@polar-sh/sdk/webhooks', () => ({
  validateEvent: vi.fn().mockReturnValue({
    type: 'subscription.created',
    data: {
      id: 'sub_test_123',
      customerId: 'cus_test_456',
      customer: { email: 'test@example.com' },
      status: 'active',
      productId: 'prod_test_789',
    },
  }),
  WebhookVerificationError: class WebhookVerificationError extends Error {},
}))

describe('polar webhook — subscription.created', () => {
  beforeEach(() => {
    mockUpsert.mockResolvedValue({ error: null })
    process.env.POLAR_WEBHOOK_SECRET = 'test-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  })

  it('returns 200 and upserts the subscription on success', async () => {
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/webhooks/polar', {
      method: 'POST',
      headers: { 'webhook-signature': 'valid-sig' },
      body: JSON.stringify({ type: 'subscription.created' }),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledOnce()
    const upsertArgs = mockUpsert.mock.calls[0][0]
    expect(upsertArgs).toHaveProperty('email', 'test@example.com')
    expect(upsertArgs).toHaveProperty('polar_subscription_id', 'sub_test_123')
    expect(upsertArgs).toHaveProperty('api_key')
    expect(typeof upsertArgs.api_key).toBe('string')
    expect(upsertArgs.api_key).toHaveLength(64) // 32 bytes hex
  })

  it('returns 500 when upsert fails so Polar can retry', async () => {
    mockUpsert.mockResolvedValue({
      error: { message: 'column does not exist' },
    })
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/webhooks/polar', {
      method: 'POST',
      headers: { 'webhook-signature': 'valid-sig' },
      body: JSON.stringify({ type: 'subscription.created' }),
    })
    const response = await POST(request as never)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})
