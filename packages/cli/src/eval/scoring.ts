import type {TestPrompt} from './prompts.js'

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

const SCORE_WEIGHTS = {
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

/**
 * Weighted pass rate: each probe contributes its declared weight (0–1).
 * A probe with weight 0.15 failing costs twice as much as one with weight 0.10.
 * Falls back to simple pass rate if no weight map is provided.
 */
function weightedPassRate(
  results: EvalResult[],
  weightByProbeId: Record<string, number>,
): number {
  if (results.length === 0) return 0
  let earnedWeight = 0
  let totalWeight = 0
  for (const r of results) {
    const w = weightByProbeId[r.promptId] ?? 1 / results.length
    totalWeight += w
    if (r.passed) earnedWeight += w
  }
  return totalWeight > 0 ? earnedWeight / totalWeight : 0
}

export function computeTrustScore(
  results: EvalResult[],
  prompts?: TestPrompt[],
): TrustScore {
  const weightByProbeId: Record<string, number> = {}
  if (prompts) {
    for (const p of prompts) weightByProbeId[p.id] = p.weight
  }

  const passRate = weightedPassRate(results, weightByProbeId)
  const passed = results.filter((r) => r.passed)

  const sortedLatencies = results.map((r) => r.durationMs).sort((a, b) => a - b)
  const p50 = percentile(sortedLatencies, 50)

  const errorsByFailureMode = results
    .filter((r) => !r.passed)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.failureMode] = (acc[r.failureMode] ?? 0) + 1
      return acc
    }, {})

  const rawScore =
    passRate * 100 * SCORE_WEIGHTS.passRate +
    latencyScore(p50) * SCORE_WEIGHTS.latency +
    errorTaxonomyScore(results) * SCORE_WEIGHTS.errorTaxonomy

  return {
    score: Math.round(rawScore),
    passRate,
    p50LatencyMs: p50,
    errorsByFailureMode,
    totalPrompts: results.length,
    passedPrompts: passed.length,
  }
}
