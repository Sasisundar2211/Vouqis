import { describe, it, expect } from 'vitest'
import { classifyChanges } from './change-classifier'

describe('change-classifier', () => {
  describe('classifyChanges', () => {
    it('classifies prompt file', () => {
      expect(classifyChanges(['prompts/chat.txt'])).toContain('prompt_file')
    })

    it('classifies system prompt', () => {
      expect(classifyChanges(['system_prompt.md'])).toContain('system_prompt')
    })

    it('classifies mcp server', () => {
      expect(classifyChanges(['mcp/server.yaml'])).toContain('mcp_server')
    })

    it('classifies guardrails', () => {
      expect(classifyChanges(['guardrails/policy.yaml'])).toContain('guardrails')
    })

    it('classifies agent workflow', () => {
      expect(classifyChanges(['agents/orchestrator.py'])).toContain('agent_workflow')
    })

    it('returns multiple types for multiple files', () => {
      const types = classifyChanges(['prompts/base.md', 'mcp/server.yaml'])
      expect(types).toContain('prompt_file')
      expect(types).toContain('mcp_server')
    })

    it('deduplicates types across files', () => {
      const types = classifyChanges(['prompts/a.txt', 'prompts/b.txt'])
      expect(types.filter((t) => t === 'prompt_file')).toHaveLength(1)
    })

    it('returns empty array for unclassifiable files', () => {
      expect(classifyChanges(['src/utils.ts'])).toEqual([])
    })
  })
})
