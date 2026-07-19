import * as crypto from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { verifyWebhookSignature } from './webhook'

function makeSignature(body: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
}

describe('webhook', () => {
  describe('verifyWebhookSignature', () => {
    it('accepts a valid signature', () => {
      const body = '{"action":"opened"}'
      const secret = 'test-secret'
      expect(verifyWebhookSignature(body, makeSignature(body, secret), secret)).toBe(true)
    })

    it('rejects a wrong signature', () => {
      expect(verifyWebhookSignature('body', 'sha256=deadbeef', 'secret')).toBe(false)
    })

    it('rejects a null signature', () => {
      expect(verifyWebhookSignature('body', null, 'secret')).toBe(false)
    })

    it('rejects a signature without sha256= prefix', () => {
      const body = 'test'
      const raw = crypto.createHmac('sha256', 'secret').update(body).digest('hex')
      expect(verifyWebhookSignature(body, raw, 'secret')).toBe(false)
    })

    it('rejects empty body with wrong sig', () => {
      expect(verifyWebhookSignature('', 'sha256=wrongsig', 'secret')).toBe(false)
    })
  })
})
