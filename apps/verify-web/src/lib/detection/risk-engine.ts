import type { ChangeType } from '@/lib/detection/change-classifier'

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW'

const HIGH: Set<ChangeType> = new Set([
  'prompt_file',
  'model_version',
  'guardrails',
  'system_prompt',
  'agent_workflow',
])

const MEDIUM: Set<ChangeType> = new Set([
  'tool_schema',
  'mcp_server',
  'output_schema',
  'few_shot_examples',
  'retrieval_config',
])

export function computeRisk(types: ChangeType[]): RiskLevel {
  if (types.some((t) => HIGH.has(t))) return 'HIGH'
  if (types.some((t) => MEDIUM.has(t))) return 'MEDIUM'
  return 'LOW'
}

export function evidenceScore(aiFiles: string[], types: ChangeType[]): number {
  // ponytail: simple heuristic, each file adds up to 5, each type adds up to 5
  const fileScore = Math.min(aiFiles.length * 2, 5)
  const typeScore = Math.min(types.length * 1, 5)
  return fileScore + typeScore
}
