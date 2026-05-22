/**
 * Sends a signed subscription.created webhook to the production endpoint.
 * Uses the actual standardwebhooks Webhook class (same as Polar SDK validateEvent).
 * Usage: node scripts/test-webhook.mjs
 */
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {Webhook} = require('/Users/sasisundar/Desktop/Vouqis/node_modules/standardwebhooks/dist/index.js')

// ── Load POLAR_WEBHOOK_SECRET from .env.local ─────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '../packages/vouqis-dashboard/.env.local')

let webhookSecret = process.env.POLAR_WEBHOOK_SECRET
if (!webhookSecret && fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key?.trim() === 'POLAR_WEBHOOK_SECRET') {
      webhookSecret = rest.join('=').trim()
      break
    }
  }
}

if (!webhookSecret) {
  console.error('POLAR_WEBHOOK_SECRET not found')
  process.exit(1)
}

// Polar SDK wraps the secret in base64 before passing to Webhook()
const base64Secret = Buffer.from(webhookSecret, 'utf-8').toString('base64')
const wh = new Webhook(base64Secret)

// ── Build the payload ─────────────────────────────────────────────────────────
const msgId = `msg_test_${Date.now()}`
const now = new Date().toISOString()
const future = new Date(Date.now() + 30 * 86400000).toISOString()
const payload = JSON.stringify({
  type: 'subscription.created',
  timestamp: now,
  data: {
    id: 'sub_test_fixed_001',  // fixed ID so retries use upsert path, not duplicate insert
    created_at: now, modified_at: now,
    customer_id: 'cus_test_123',
    customer: {
      id: 'cus_test_123', created_at: now, modified_at: now,
      email: 'sasisundhar2211@gmail.com', email_verified: true,
      type: 'individual', name: 'Test User',
      billing_address: null, tax_id: null,
      avatar_url: 'https://example.com/avatar.png',
      organization_id: 'org_test_001', deleted_at: null,
      metadata: {}, custom_field_data: {},
    },
    status: 'active',
    product_id: 'prod_test_001',
    product: {
      id: 'prod_test_001', created_at: now, modified_at: now,
      name: 'Vouqis Pro', description: null,
      is_recurring: true, is_archived: false,
      organization_id: 'org_test_001', visibility: 'public',
      trial_interval: null, trial_interval_count: null,
      recurring_interval: 'month', recurring_interval_count: 1,
      prices: [], benefits: [], medias: [],
      attached_custom_fields: [], metadata: {},
    },
    amount: 999, currency: 'usd',
    recurring_interval: 'month', recurring_interval_count: 1,
    current_period_start: now, current_period_end: future,
    trial_start: null, trial_end: null,
    cancel_at_period_end: false, canceled_at: null,
    started_at: now, ended_at: null, ends_at: null,
    checkout_id: null,
    customer_cancellation_reason: null, customer_cancellation_comment: null,
    organization_id: 'org_test_001', user_id: null,
    metadata: {}, custom_field_data: {},
    discount_id: null, discount: null,
    price_id: null, price: null,
    prices: [], meters: [], pending_update: null,
  },
})

// Timestamp must be the same object used in sign() and in the header
const ts = new Date()
const msgTimestamp = Math.floor(ts.getTime() / 1000).toString()

// sign() returns "v1,<base64sig>" — use it directly as the header value
const signature = wh.sign(msgId, ts, payload)

// ── Send ──────────────────────────────────────────────────────────────────────
const url = process.env.WEBHOOK_URL || 'https://vouqis.vercel.app/api/webhooks/polar'
console.log(`\nPOST ${url}`)
console.log(`webhook-id:        ${msgId}`)
console.log(`webhook-timestamp: ${msgTimestamp}`)
console.log(`webhook-signature: ${signature}\n`)

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'webhook-id': msgId,
    'webhook-timestamp': msgTimestamp,
    'webhook-signature': signature,
  },
  body: payload,
})

const body = await res.text()
console.log(`HTTP ${res.status}`)
console.log(body || '(empty body)')
