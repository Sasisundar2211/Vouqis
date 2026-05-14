export interface EvalResult {
  promptId: string
  failureMode: string
  passed: boolean
  durationMs: number
  errorText?: string
  toolCalled?: string
}

export interface TrustScore {
  score: number
  passRate: number
  p50LatencyMs: number
  errorsByFailureMode: Record<string, number>
  totalPrompts: number
  passedPrompts: number
}

const WEIGHTS = {
  passRate: 0.5,
  latency: 0.3,
  errorTaxonomy: 0.2,
} as const

function latencyScore(p50Ms: number): number {
  if (p50Ms <= 500) return 100
  if (p50Ms <= 1000) return 90
  if (p50Ms <= 2000) return 75
  if (p50Ms <= 4000) return 50
  if (p50Ms <= 8000) return 25
  return 0
}

function errorTaxonomyScore(results: EvalResult[]): number {
  const failed = results.filter((r) => !r.passed)
  if (failed.length === 0) return 100
  const modes = new Set(failed.map((r) => r.failureMode))
  // 20-point penalty per distinct failure mode beyond the first
  const penalty = (modes.size - 1) * 20
  return Math.max(0, 100 - penalty)
}

function percentile(sortedMs: number[], p: number): number {
  if (sortedMs.length === 0) return 0
  const idx = Math.ceil((p / 100) * sortedMs.length) - 1
  return sortedMs[Math.max(0, idx)]
}

export function computeTrustScore(results: EvalResult[]): TrustScore {
  const passed = results.filter((r) => r.passed)
  const passRate = results.length > 0 ? passed.length / results.length : 0

  const sortedLatencies = results.map((r) => r.durationMs).sort((a, b) => a - b)
  const p50 = percentile(sortedLatencies, 50)

  const errorsByFailureMode = results
    .filter((r) => !r.passed)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.failureMode] = (acc[r.failureMode] ?? 0) + 1
      return acc
    }, {})

  const rawScore =
    passRate * 100 * WEIGHTS.passRate +
    latencyScore(p50) * WEIGHTS.latency +
    errorTaxonomyScore(results) * WEIGHTS.errorTaxonomy

  return {
    score: Math.round(rawScore),
    passRate,
    p50LatencyMs: p50,
    errorsByFailureMode,
    totalPrompts: results.length,
    passedPrompts: passed.length,
  }
}
