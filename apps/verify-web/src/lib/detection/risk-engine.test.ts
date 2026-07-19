import { describe, it, expect } from 'vitest'
import { computeRisk, evidenceScore } from './risk-engine'

describe('risk-engine', () => {
  describe('computeRisk', () => {
    it('returns HIGH when prompt_file present', () => {
      expect(computeRisk(['prompt_file'])).toBe('HIGH')
    })

    it('returns HIGH when guardrails present', () => {
      expect(computeRisk(['guardrails'])).toBe('HIGH')
    })

    it('returns HIGH when model_version present', () => {
      expect(computeRisk(['model_version'])).toBe('HIGH')
    })

    it('returns MEDIUM when tool_schema present and no HIGH types', () => {
      expect(computeRisk(['tool_schema'])).toBe('MEDIUM')
    })

    it('returns MEDIUM when mcp_server present', () => {
      expect(computeRisk(['mcp_server'])).toBe('MEDIUM')
    })

    it('returns LOW for low-risk types only', () => {
      expect(computeRisk(['eval_dataset', 'eval_config'])).toBe('LOW')
    })

    it('returns LOW for empty types', () => {
      expect(computeRisk([])).toBe('LOW')
    })

    it('HIGH overrides MEDIUM when mixed', () => {
      expect(computeRisk(['tool_schema', 'guardrails'])).toBe('HIGH')
    })
  })

  describe('evidenceScore', () => {
    it('scores zero for empty inputs', () => {
      expect(evidenceScore([], [])).toBe(0)
    })

    it('caps file score at 5', () => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f']
      expect(evidenceScore(files, [])).toBe(5)
    })

    it('caps type score at 5', () => {
      const types = ['prompt_file', 'guardrails', 'model_version', 'tool_schema', 'mcp_server', 'output_schema'] as const
      expect(evidenceScore([], [...types])).toBe(5)
    })

    it('returns max 10', () => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f']
      const types = ['prompt_file', 'guardrails', 'model_version', 'tool_schema', 'mcp_server', 'output_schema'] as const
      expect(evidenceScore(files, [...types])).toBe(10)
    })
  })
})
