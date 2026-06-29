import {classify} from './classify.js'
import type {Failure} from './failure.js'
import type {PolicyDecision, PolicyResult} from './policy.js'
import type {ReliabilityEvent} from './events.js'

export interface EventContext {
  timestamp: string
  upstream: string
  server_id: string
  method: string
  tool?: string
  requestId?: string | number | null
  attempt: number
  latency_ms: number
}

export interface EvaluationOutcome {
  decision: PolicyDecision
  reason?: string
  error?: Error
  statusCode?: number
}

export interface ReliabilityResult {
  failure?: Failure
  policy: PolicyResult
  event: ReliabilityEvent
}

export function evaluateReliability(ctx: EventContext, outcome: EvaluationOutcome): ReliabilityResult {
  const failure = deriveFailure(outcome)
  const policy = evaluatePolicy(outcome)
  const event: ReliabilityEvent = {...ctx, decision: policy.decision, reason: policy.reason}
  return {failure, policy, event}
}

function deriveFailure(outcome: EvaluationOutcome): Failure | undefined {
  if (outcome.decision === 'allow') return undefined
  if (outcome.error) return classify({kind: 'transport', error: outcome.error})
  if (outcome.statusCode !== undefined && outcome.statusCode >= 400) {
    return classify({kind: 'runtime', statusCode: outcome.statusCode, reason: outcome.reason ?? ''})
  }
  if (outcome.reason) return classify({kind: 'protocol', reason: outcome.reason})
  return undefined
}

function evaluatePolicy(outcome: EvaluationOutcome): PolicyResult {
  return {decision: outcome.decision, reason: outcome.reason}
}
