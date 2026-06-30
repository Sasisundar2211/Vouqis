// PROTOTYPE — keep this module if validated. Delete tui.ts when done.
// Question: does the reliability pipeline + interview tracking feel right end-to-end?

import {evaluateReliability} from '../reliability/pipeline.js'
import type {EventContext, EvaluationOutcome, ReliabilityResult} from '../reliability/pipeline.js'
import type {FailureClass} from '../reliability/failure.js'

export const INSPECT_NEXT: Record<FailureClass, string> = {
  invalid_json:     'Inspect the raw response body for malformed or truncated JSON.',
  invalid_jsonrpc:  'Verify the JSON-RPC envelope — jsonrpc version, id, and method fields.',
  schema_violation: 'Validate the tool response against the declared MCP schema.',
  timeout:          'Check upstream latency and consider raising the timeout configuration.',
  transport_error:  'Verify network connectivity and upstream server availability.',
  upstream_error:   'Inspect the upstream HTTP status and response body for details.',
  unknown:          'Capture the full request and response for manual inspection.',
}

export type HypothesisStatus = 'unknown' | 'candidate' | 'validated' | 'killed'

export type Hypothesis = {
  id: string
  description: string
  confirmations: number
  disconfirmations: number
  status: HypothesisStatus
}

export type Scenario = {
  name: string
  server: string
  tool: string
  observed: string[]
  outcome: EvaluationOutcome
}

export type InterviewRecord = {
  scenarioName: string
  tfca_ms: number
  actionAccuracy: boolean
  confidence: number
  hypothesisId: string
  hypothesisVerdict: 'confirmed' | 'disconfirmed'
}

export type UIMode = 'main' | 'tfca' | 'confidence' | 'hypothesis' | 'summary'

export type PrototypeState = {
  scenario: Scenario | null
  scenarioIndex: number | null
  result: ReliabilityResult | null
  scenarioStartedAt: number | null
  hypotheses: Hypothesis[]
  activeHypothesisIndex: number
  founderMode: boolean
  uiMode: UIMode
  currentInterview: Partial<InterviewRecord>
  interviewLog: InterviewRecord[]
  lastAction: string
}

export type Action =
  | {type: 'SELECT_SCENARIO'; index: number}
  | {type: 'TOGGLE_FOUNDER'}
  | {type: 'NEXT_HYPOTHESIS'}
  | {type: 'START_RECORDING'}
  | {type: 'RECORD_TFCA'; correct: boolean}
  | {type: 'RECORD_CONFIDENCE'; score: number}
  | {type: 'RECORD_HYPOTHESIS'; verdict: 'confirmed' | 'disconfirmed'}
  | {type: 'DISMISS_SUMMARY'}
  | {type: 'RESET'}

const SCENARIOS: Scenario[] = [
  {
    name: 'Null result',
    server: 'api.github.com',
    tool: 'search_code',
    observed: ['tools/call response.result is null', 'HTTP 200 OK', 'Content array is empty'],
    outcome: {decision: 'block', reason: 'tools/call result is null'},
  },
  {
    name: 'Timeout',
    server: 'mcp.stripe.com',
    tool: 'create_payment',
    observed: ['Request exceeded 5000ms threshold', 'Upstream did not respond in time'],
    outcome: {
      decision: 'block',
      reason: 'Request timed out after 5000ms',
      error: Object.assign(new Error('Request timed out after 5000ms'), {name: 'TimeoutError'}),
    },
  },
  {
    name: 'Invalid JSON',
    server: 'tools.openai.com',
    tool: 'generate',
    observed: ['Response body failed JSON.parse()', 'HTTP 200 OK', 'Body appears truncated'],
    outcome: {decision: 'block', reason: 'response body is not valid JSON'},
  },
  {
    name: 'Schema violation',
    server: 'api.linear.app',
    tool: 'create_issue',
    observed: ['HTTP 200 OK', 'result present but missing required content field', 'Parsed JSON shape invalid'],
    outcome: {decision: 'block', reason: 'response missing required content field'},
  },
  {
    name: 'Transport error',
    server: 'mcp.notion.so',
    tool: 'query_database',
    observed: ['TCP connection refused (ECONNREFUSED)', 'No upstream response received'],
    outcome: {decision: 'block', error: new Error('ECONNREFUSED: connection refused')},
  },
  {
    name: 'Upstream 503',
    server: 'api.anthropic.com',
    tool: 'messages',
    observed: ['HTTP 503 Service Unavailable', 'Upstream returned error status'],
    outcome: {decision: 'block', statusCode: 503, reason: 'Service Unavailable'},
  },
  {
    name: 'Allow (clean)',
    server: 'api.github.com',
    tool: 'list_repos',
    observed: ['HTTP 200 OK', 'Response schema valid', 'result field present and non-null'],
    outcome: {decision: 'allow'},
  },
]

const INITIAL_HYPOTHESES: Hypothesis[] = [
  {
    id: 'H0',
    description: 'Production MCP deployments are compatible with a gateway architecture.',
    confirmations: 0,
    disconfirmations: 0,
    status: 'unknown',
  },
  {
    id: 'H1',
    description: 'Runtime reliability is painful enough to justify a dedicated gateway.',
    confirmations: 0,
    disconfirmations: 0,
    status: 'unknown',
  },
  {
    id: 'H2',
    description: 'Failure Receipts reduce TFCA.',
    confirmations: 0,
    disconfirmations: 0,
    status: 'unknown',
  },
]

function deriveStatus(h: Hypothesis): HypothesisStatus {
  if (h.disconfirmations > 0 && h.confirmations === 0) return 'killed'
  if (h.confirmations >= 3) return 'validated'
  if (h.confirmations >= 1) return 'candidate'
  return 'unknown'
}

export function initialState(): PrototypeState {
  return {
    scenario: null,
    scenarioIndex: null,
    result: null,
    scenarioStartedAt: null,
    hypotheses: INITIAL_HYPOTHESES.map(h => ({...h})),
    activeHypothesisIndex: 0,
    founderMode: false,
    uiMode: 'main',
    currentInterview: {},
    interviewLog: [],
    lastAction: 'ready',
  }
}

export function getScenarios(): readonly Scenario[] {
  return SCENARIOS
}

export function reduce(state: PrototypeState, action: Action): PrototypeState {
  switch (action.type) {
    case 'SELECT_SCENARIO': {
      if (state.uiMode !== 'main') return state
      const scenario = SCENARIOS[action.index]
      if (!scenario) return {...state, lastAction: `no scenario at index ${action.index}`}
      const ctx: EventContext = {
        timestamp: new Date().toISOString(),
        upstream: `https://${scenario.server}`,
        server_id: scenario.server,
        method: 'tools/call',
        tool: scenario.tool,
        requestId: Math.floor(Math.random() * 100) + 1,
        attempt: 1,
        latency_ms: Math.floor(Math.random() * 700) + 50,
      }
      const result = evaluateReliability(ctx, scenario.outcome)
      return {
        ...state,
        scenario,
        scenarioIndex: action.index,
        result,
        scenarioStartedAt: Date.now(),
        currentInterview: {scenarioName: scenario.name},
        lastAction: `scenario ${action.index + 1}: ${scenario.name}`,
      }
    }

    case 'TOGGLE_FOUNDER':
      return {
        ...state,
        founderMode: !state.founderMode,
        lastAction: state.founderMode ? 'founder mode off' : 'founder mode on',
      }

    case 'NEXT_HYPOTHESIS': {
      const next = (state.activeHypothesisIndex + 1) % state.hypotheses.length
      return {
        ...state,
        activeHypothesisIndex: next,
        lastAction: `active → ${state.hypotheses[next]?.id ?? '?'}`,
      }
    }

    case 'START_RECORDING': {
      if (!state.scenario || state.uiMode !== 'main') return state
      return {...state, uiMode: 'tfca', lastAction: 'recording TFCA…'}
    }

    case 'RECORD_TFCA': {
      if (state.uiMode !== 'tfca') return state
      const elapsed = state.scenarioStartedAt ? Date.now() - state.scenarioStartedAt : 0
      return {
        ...state,
        uiMode: 'confidence',
        currentInterview: {
          ...state.currentInterview,
          tfca_ms: elapsed,
          actionAccuracy: action.correct,
        },
        lastAction: `TFCA: ${(elapsed / 1000).toFixed(1)}s  accuracy: ${action.correct ? 'correct' : 'incorrect'}`,
      }
    }

    case 'RECORD_CONFIDENCE': {
      if (state.uiMode !== 'confidence') return state
      return {
        ...state,
        uiMode: 'hypothesis',
        currentInterview: {...state.currentInterview, confidence: action.score},
        lastAction: `confidence: ${action.score}/5`,
      }
    }

    case 'RECORD_HYPOTHESIS': {
      if (state.uiMode !== 'hypothesis') return state
      const active = state.hypotheses[state.activeHypothesisIndex]
      if (!active) return state

      const hypotheses = state.hypotheses.map((h, i) => {
        if (i !== state.activeHypothesisIndex) return h
        const updated = action.verdict === 'confirmed'
          ? {...h, confirmations: h.confirmations + 1}
          : {...h, disconfirmations: h.disconfirmations + 1}
        return {...updated, status: deriveStatus(updated)}
      })

      const record: InterviewRecord = {
        scenarioName: state.currentInterview.scenarioName ?? '?',
        tfca_ms: state.currentInterview.tfca_ms ?? 0,
        actionAccuracy: state.currentInterview.actionAccuracy ?? false,
        confidence: state.currentInterview.confidence ?? 0,
        hypothesisId: active.id,
        hypothesisVerdict: action.verdict,
      }

      return {
        ...state,
        hypotheses,
        uiMode: 'summary',
        currentInterview: record,
        interviewLog: [...state.interviewLog, record],
        lastAction: `${action.verdict} ${active.id}`,
      }
    }

    case 'DISMISS_SUMMARY':
      return {
        ...state,
        uiMode: 'main',
        currentInterview: {},
        scenarioStartedAt: null,
        lastAction: `interview #${state.interviewLog.length} saved`,
      }

    case 'RESET':
      return initialState()
  }
}
