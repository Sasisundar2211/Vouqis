import {describe, it, expect} from 'vitest'
import {computeTrustScore} from '../src/eval/scoring.js'
import {DEFAULT_PROMPTS} from '../src/eval/prompts.js'

// ── Prompt contract ──────────────────────────────────────────────────────────

describe('DEFAULT_PROMPTS', () => {
  it('contains exactly 10 entries', () => {
    expect(DEFAULT_PROMPTS).toHaveLength(10)
  })

  it('has exactly 2 prompts per failure mode', () => {
    const modes = DEFAULT_PROMPTS.map((p) => p.failureMode)
    const unique = [...new Set(modes)]
    expect(unique).toHaveLength(5)
    for (const mode of unique) {
      expect(modes.filter((m) => m === mode)).toHaveLength(2)
    }
  })

  it('covers all five required failure modes', () => {
    const modes = new Set(DEFAULT_PROMPTS.map((p) => p.failureMode))
    expect(modes.has('malformed-jsonrpc')).toBe(true)
    expect(modes.has('missing-params')).toBe(true)
    expect(modes.has('timeout')).toBe(true)
    expect(modes.has('unexpected-schema')).toBe(true)
    expect(modes.has('null-response')).toBe(true)
  })

  it('direct probes (mjr-*, mrp-*) have empty userMessage', () => {
    const directProbes = DEFAULT_PROMPTS.filter((p) =>
      ['malformed-rpc', 'missing-params'].includes(p.probeType),
    )
    for (const p of directProbes) {
      expect(p.userMessage).toBe('')
    }
  })

  it('Claude probes (tmo-*, urs-*, nul-*) have non-empty userMessage', () => {
    const claudeProbes = DEFAULT_PROMPTS.filter((p) =>
      ['timeout', 'schema-validation', 'null-check'].includes(p.probeType),
    )
    for (const p of claudeProbes) {
      expect(p.userMessage.length).toBeGreaterThan(0)
    }
  })
})

// ── Trust score algorithm ────────────────────────────────────────────────────

describe('computeTrustScore', () => {
  const base = DEFAULT_PROMPTS.map((p) => ({
    promptId: p.id,
    failureMode: p.failureMode,
    passed: true,
    durationMs: 200,
  }))

  it('returns 100 when all prompts pass with low latency', () => {
    const {score} = computeTrustScore(base)
    expect(score).toBe(100)
  })

  it('returns a very low score when all prompts fail with high latency', () => {
    const results = base.map((r) => ({...r, passed: false, durationMs: 10_000, errorText: 'err'}))
    const {score} = computeTrustScore(results)
    // passRate=0 (0pts), latency>8s (0pts), 5 distinct modes → taxonomy=(100-80)*0.2=4
    expect(score).toBe(4)
  })

  it('pass rate is exactly 0.5 when half pass', () => {
    const results = base.map((r, i) => ({...r, passed: i % 2 === 0}))
    expect(computeTrustScore(results).passRate).toBeCloseTo(0.5, 2)
  })

  it('penalises high P50 latency vs low P50', () => {
    const fast = base.map((r) => ({...r, durationMs: 100}))
    const slow = base.map((r) => ({...r, durationMs: 6000}))
    expect(computeTrustScore(fast).score).toBeGreaterThan(computeTrustScore(slow).score)
  })

  it('p50LatencyMs is the median duration', () => {
    // 10 items, all 500ms → P50 = 500
    const results = base.map((r) => ({...r, durationMs: 500}))
    expect(computeTrustScore(results).p50LatencyMs).toBe(500)
  })

  it('applies weights 0.5 / 0.3 / 0.2 correctly', () => {
    // All pass (passRate=1 → 50pts), low P50=200 → latencyScore=100 → 30pts, no errors → 20pts = 100
    expect(computeTrustScore(base).score).toBe(100)

    // All fail (passRate=0 → 0pts), high P50 → latencyScore=0 → 0pts,
    // but errorTaxonomy: 5 modes → penalty=(5-1)*20=80 → score=20 → 20*0.2=4
    const allFail = base.map((r) => ({...r, passed: false, durationMs: 10_000, errorText: 'x'}))
    const {score} = computeTrustScore(allFail)
    expect(score).toBe(4) // 0 + 0 + (100-80)*0.2 = 4
  })

  it('errorsByFailureMode counts failures per mode', () => {
    const results = base.map((r, i) => ({
      ...r,
      passed: i < 2 ? false : true,
      errorText: i < 2 ? 'err' : undefined,
    }))
    const {errorsByFailureMode} = computeTrustScore(results)
    // First 2 prompts are malformed-jsonrpc
    expect(errorsByFailureMode['malformed-jsonrpc']).toBe(2)
  })
})
