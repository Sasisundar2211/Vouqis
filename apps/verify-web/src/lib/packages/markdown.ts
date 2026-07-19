import type { ChangeType } from '@/lib/detection/change-classifier'
import type { RiskLevel } from '@/lib/detection/risk-engine'

const MARKER = '<!-- vouqis-verify -->'
export const PACKAGE_VERSION = 1

type PackageInput = {
  owner: string
  repo: string
  prNumber: number
  prTitle: string
  headSha: string
  baseRef: string
  aiFiles: string[]
  changeTypes: ChangeType[]
  risk: RiskLevel
  score: number
  baseUrl: string
}

const RISK_ICON: Record<RiskLevel, string> = {
  HIGH: '🔴',
  MEDIUM: '🟡',
  LOW: '🟢',
}

const CHANGE_LABEL: Record<ChangeType, string> = {
  prompt_file: 'Prompt File',
  model_version: 'Model Version',
  tool_schema: 'Tool Schema',
  mcp_server: 'MCP Server Config',
  agent_workflow: 'Agent Workflow',
  guardrails: 'Guardrails',
  output_schema: 'Output Schema',
  temperature_config: 'Temperature / Sampling',
  system_prompt: 'System Prompt',
  few_shot_examples: 'Few-shot Examples',
  retrieval_config: 'Retrieval Config',
  vector_store: 'Vector Store',
  embedding_model: 'Embedding Model',
  eval_dataset: 'Eval Dataset',
  eval_config: 'Eval Config',
  fine_tune_config: 'Fine-tune Config',
  inference_config: 'Inference Config',
}

export function buildReviewPackage(input: PackageInput): string {
  const { owner, repo, prNumber, prTitle, headSha, baseRef, aiFiles, changeTypes, risk, score, baseUrl } = input
  const shortSha = headSha.slice(0, 7)

  const changeList = changeTypes.map((t) => `- ${CHANGE_LABEL[t]}`).join('\n')
  const fileList = aiFiles.map((f) => `- \`${f}\``).join('\n')

  const feedbackBase = `${baseUrl}/api/feedback?pr=${owner}%2F${repo}%2F${prNumber}`
  const q1Links = [
    `[Merged — the package gave me confidence](${feedbackBase}&q1=merged)`,
    `[Delayed or blocked — something needed attention](${feedbackBase}&q1=blocked)`,
    `[No change — I'd have made the same call](${feedbackBase}&q1=no-change)`,
    `[Didn't use it — not applicable](${feedbackBase}&q1=skipped)`,
  ]
  const q2Links = [
    `[Nothing — Vouqis was enough](${feedbackBase}&q2=none)`,
    `[GitHub diff only](${feedbackBase}&q2=github)`,
    `[Langfuse / LangSmith](${feedbackBase}&q2=observability)`,
    `[Something else](${feedbackBase}&q2=other)`,
  ]

  const q3Links = [
    `[Langfuse](${feedbackBase}&q3=langfuse)`,
    `[LangSmith](${feedbackBase}&q3=langsmith)`,
    `[Promptfoo](${feedbackBase}&q3=promptfoo)`,
    `[Logs](${feedbackBase}&q3=logs)`,
    `[Another engineer](${feedbackBase}&q3=peer)`,
    `[Nothing else](${feedbackBase}&q3=none)`,
    `[Other](${feedbackBase}&q3=other)`,
  ]

  const generatedAt = new Date().toISOString()
  const confidenceLevel = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low'
  const footer = [
    `Generated from: ✓ Prompt Diff  ✓ Changed Files  ✗ Trace Comparison  ✗ Production Examples`,
    `Confidence: **${confidenceLevel}** (${score}/10) · commit \`${shortSha}\` vs \`${baseRef}\` · v${PACKAGE_VERSION}`,
  ].join('\n')

  const viewPixel = `![](${baseUrl}/api/track/view?pr=${encodeURIComponent(`${owner}/${repo}/${prNumber}`)}&v=${PACKAGE_VERSION})`

  return `${MARKER}
<!-- vouqis-generated-at:${generatedAt} -->
## AI Change Review Package — ${prTitle}

${viewPixel}

${RISK_ICON[risk]} **Risk: ${risk}** · ${changeTypes.length} change type${changeTypes.length === 1 ? '' : 's'} detected

---

### What changed

${changeList || '_No AI change types classified_'}

<details>
<summary>AI files in this PR (${aiFiles.length})</summary>

${fileList || '_None detected_'}

</details>

---

### Prompt diff

> Diff generated from \`${baseRef}\` → \`${shortSha}\`

_Trace comparison and production examples unlock when you connect an observability integration._

---

### Which best describes this review?

${q1Links.join(' · ')}

### What else did you open?

${q2Links.join(' · ')}

### What evidence did you still need before merging?

${q3Links.join(' · ')}

---

<sub>${footer}</sub>
`
}
