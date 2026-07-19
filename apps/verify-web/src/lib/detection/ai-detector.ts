const AI_PATH_PATTERNS = [
  'prompts/',
  'prompt/',
  '.prompt',
  'agents/',
  'agent/',
  'evals/',
  'eval/',
  'tools/',
  'schemas/',
  'mcp/',
  'guardrails/',
  'workflows/',
  'retrieval/',
  'embeddings/',
  'fine-tune/',
  'fine_tune/',
  'inference/',
  'config/ai',
  'config/llm',
  'config/model',
  '.promptrc',
  'system_prompt',
  'system-prompt',
]

const AI_FILENAME_PATTERNS = [
  /\.prompt\.(txt|md|yaml|yml|json)$/i,
  /^system[_-]prompt/i,
  /model[_-]?config\.(yaml|yml|json|ts|py)$/i,
  /agent[_-]?config\.(yaml|yml|json|ts|py)$/i,
  /mcp[_-]?(server|config)\.(yaml|yml|json|ts|py)$/i,
  /guardrail[s]?\.(yaml|yml|json|ts|py)$/i,
  /eval[_-]?config\.(yaml|yml|json|ts|py)$/i,
  /\.eval\.(yaml|yml|json)$/i,
  /few[_-]?shot\.(yaml|yml|json|txt|md)$/i,
  /tool[_-]?schema\.(yaml|yml|json|ts)$/i,
]

export function detectAIFiles(changedFiles: string[]): string[] {
  return changedFiles.filter((f) => matchesAIPath(f) || matchesAIFilename(f))
}

function matchesAIPath(filepath: string): boolean {
  return AI_PATH_PATTERNS.some((p) => filepath.startsWith(p) || filepath.includes('/' + p))
}

function matchesAIFilename(filepath: string): boolean {
  const base = filepath.split('/').pop() ?? filepath
  return AI_FILENAME_PATTERNS.some((re) => re.test(base))
}
