export type ChangeType =
  | 'prompt_file'
  | 'model_version'
  | 'tool_schema'
  | 'mcp_server'
  | 'agent_workflow'
  | 'guardrails'
  | 'output_schema'
  | 'temperature_config'
  | 'system_prompt'
  | 'few_shot_examples'
  | 'retrieval_config'
  | 'vector_store'
  | 'embedding_model'
  | 'eval_dataset'
  | 'eval_config'
  | 'fine_tune_config'
  | 'inference_config'

type ClassifierRule = { type: ChangeType; patterns: RegExp[] }

const RULES: ClassifierRule[] = [
  { type: 'system_prompt', patterns: [/system[_-]?prompt/i] },
  { type: 'prompt_file', patterns: [/\.prompt\.(txt|md|yaml|yml|json)$/i, /prompts?\//i] },
  { type: 'model_version', patterns: [/model[_-]?config/i, /model[_-]?version/i] },
  { type: 'tool_schema', patterns: [/tool[_-]?schema/i, /tools\//i] },
  { type: 'mcp_server', patterns: [/mcp[_-]?(server|config)/i, /mcp\//i] },
  { type: 'agent_workflow', patterns: [/agent[_-]?config/i, /workflows?\//i, /agents?\//i] },
  { type: 'guardrails', patterns: [/guardrail/i] },
  { type: 'output_schema', patterns: [/output[_-]?schema/i, /schemas?\//i] },
  { type: 'temperature_config', patterns: [/temperature/i, /inference[_-]?config/i] },
  { type: 'few_shot_examples', patterns: [/few[_-]?shot/i] },
  { type: 'retrieval_config', patterns: [/retrieval/i, /rag[_-]?config/i] },
  { type: 'vector_store', patterns: [/vector[_-]?store/i, /embeddings?\//i] },
  { type: 'embedding_model', patterns: [/embedding[_-]?model/i] },
  { type: 'eval_dataset', patterns: [/eval[s]?\//i, /\.eval\./i] },
  { type: 'eval_config', patterns: [/eval[_-]?config/i] },
  { type: 'fine_tune_config', patterns: [/fine[_-]?tune/i] },
  { type: 'inference_config', patterns: [/inference[_-]?config/i] },
]

export function classifyChanges(aiFiles: string[]): ChangeType[] {
  const seen = new Set<ChangeType>()
  for (const file of aiFiles) {
    for (const rule of RULES) {
      if (rule.patterns.some((re) => re.test(file))) seen.add(rule.type)
    }
  }
  return [...seen]
}
