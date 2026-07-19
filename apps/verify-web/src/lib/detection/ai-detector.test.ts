import { describe, it, expect } from 'vitest'
import { detectAIFiles } from './ai-detector'

describe('ai-detector', () => {
  describe('detectAIFiles', () => {
    it('matches files in prompts/ directory', () => {
      expect(detectAIFiles(['prompts/system.txt', 'src/index.ts'])).toEqual(['prompts/system.txt'])
    })

    it('matches nested prompt paths', () => {
      expect(detectAIFiles(['src/ai/prompts/base.md'])).toEqual(['src/ai/prompts/base.md'])
    })

    it('matches .prompt extension files', () => {
      expect(detectAIFiles(['chat.prompt.yaml'])).toEqual(['chat.prompt.yaml'])
    })

    it('matches mcp server config', () => {
      expect(detectAIFiles(['mcp/server.yaml'])).toEqual(['mcp/server.yaml'])
    })

    it('ignores non-AI files', () => {
      expect(detectAIFiles(['src/utils.ts', 'README.md', 'package.json'])).toEqual([])
    })

    it('returns empty array for empty input', () => {
      expect(detectAIFiles([])).toEqual([])
    })

    it('matches guardrails file', () => {
      expect(detectAIFiles(['guardrails/policy.yaml'])).toEqual(['guardrails/policy.yaml'])
    })

    it('matches system_prompt filename', () => {
      expect(detectAIFiles(['system_prompt.txt'])).toEqual(['system_prompt.txt'])
    })
  })
})
