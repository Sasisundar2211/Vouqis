# Vouqis TODOS

Generated from /plan-ceo-review on 2026-05-17 (branch: main).

---

## P2 — Next Sprint

### TODO-1: api_key rotation endpoint
**What:** `POST /api/user/rotate-key` — generates a new api_key for an active subscriber.  
**Why:** First support request from a real customer will be "my key was leaked." No answer is a trust-destroying moment for a product that sells trust.  
**Context:** Without auth, simplest path: `POST {email}` → send one-time rotation link via Resend/SendGrid. Needs: email-to-subscription lookup, new `crypto.randomBytes(32)` key, update in DB, return new key.  
**Effort:** M (human: ~3h / CC: ~20min)  
**Depends on:** api_key model from current sprint

### TODO-2: Remove hardcoded Supabase credentials from CLI
**What:** Remove hardcoded `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `packages/cli/src/lib/supabase.ts`. CLI should write reports via `/api/reports` HTTP only (which it already does for `audit`). `score.ts` still writes directly — migrate it to call `/api/reports` as well.  
**Why:** Credentials in an npm package are flagged in every security review. After RLS fix, the anon key can't access customer PII — but it can still spam audit_reports and eval_results, and publishing creds in npm is an antipattern.  
**Context:** The hardcode was intentional for zero-config UX. The new zero-config path: `audit` already POSTs to the API; `score` needs the same treatment.  
**Files:** `packages/cli/src/lib/supabase.ts`, `packages/cli/src/commands/score.ts`  
**Effort:** M (human: ~2h / CC: ~15min)  
**Depends on:** nothing

### TODO-4: Subscription lifecycle events — past_due, refunded, chargeback
**What:** Add webhook handlers for `subscription.past_due`, `subscription.refunded`, and `order.refunded` Polar events. Update subscription status accordingly (past_due → 'past_due', refunded → 'free').  
**Why:** A refunded or chargebacked subscriber currently keeps Pro access indefinitely since the webhook only handles `revoked`/`canceled`. At 0 subscribers this is zero risk; at 10+ it becomes awkward.  
**Context:** Polar fires `subscription.past_due` when payment fails in grace period. `order.refunded` is the refund event. On any of these, set `plan = 'free'` and `report_history_days = 7` in the subscriptions table. Check the Polar webhook event reference for the full list.  
**Files:** `packages/vouqis-dashboard/src/app/api/webhooks/polar/route.ts`  
**Effort:** S (human: ~45min / CC: ~10min)  
**Depends on:** T1-T5 from current sprint (webhook must be working first)

---

## P3 — Backlog

### TODO-3: Index on subscriptions.api_key
**What:** `CREATE INDEX subscriptions_api_key_idx ON subscriptions (api_key);`  
**Why:** Every report creation with `VOUQIS_API_KEY` header runs `SELECT WHERE api_key = $1`. Without an index, this is a full table scan.  
**Context:** Not urgent at 0 subscribers. Add when subscriber count hits 100+.  
**Files:** Supabase migration  
**Effort:** S (human: ~5min / CC: ~2min)  
**Depends on:** api_key column (current sprint)
