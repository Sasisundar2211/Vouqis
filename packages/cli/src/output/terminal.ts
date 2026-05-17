import chalk from 'chalk'
import type {TrustScore, EvalResult} from '../eval/scoring.js'

export const MCP_PROTOCOL = '2025-06-18'

// ── Color palette ─────────────────────────────────────────────────────────────
const SEP = chalk.hex('#475569')('─'.repeat(50))
const dim = chalk.hex('#475569')
const label = chalk.hex('#64748b')
const blue = chalk.hex('#60a5fa')
const green = chalk.hex('#4ade80')
const red = chalk.hex('#f87171')

function barColor(score: number) {
  if (score >= 80) return chalk.hex('#4ade80')
  if (score >= 50) return chalk.hex('#fbbf24')
  return chalk.hex('#f87171')
}

// ── Section 1: Header ─────────────────────────────────────────────────────────

export function printHeader(serverUrl: string): void {
  console.log('')
  console.log(
    chalk.bold.white('VOUQIS') + dim(' ── score ── '),
  )
  console.log(green('❯') + chalk.white(' vouqis score ') + blue(serverUrl))
  console.log(SEP)
  console.log('')
}

// ── Section 1: Discovery (shown after connect) ────────────────────────────────

export function printDiscovery(toolCount: number, totalProbes: number): void {
  console.log(
    `  ${green('✓')} found ${chalk.white(String(toolCount))} tool${toolCount === 1 ? '' : 's'}` +
      ` ${dim('·')} schema valid ${dim('·')} protocol ${dim(MCP_PROTOCOL)}`,
  )
  console.log(`  Running ${chalk.white(String(totalProbes))} deterministic protocol probes`)
  console.log('')
}

// ── Section 2: Progress bar (returned as string for ora .text) ────────────────

export function formatProgress(
  completed: number,
  total: number,
  passed: number,
  failed: number,
): string {
  const filled = total > 0 ? Math.round((completed / total) * 24) : 0
  const bar = blue('█'.repeat(filled)) + chalk.dim('░'.repeat(24 - filled))
  const line1 = `  [${bar}] ${chalk.white(`${completed} / ${total}`)}`
  const line2 = `  ${green('✓')} ${chalk.white(String(passed))}   ${red('✗')} ${chalk.white(String(failed))}`
  return `${line1}\n${line2}`
}

// ── Section 3: Trust score report ────────────────────────────────────────────

export function printTrustScore(
  serverUrl: string,
  trust: TrustScore,
  results: EvalResult[],
  reportPath = './vouqis-report.json',
): void {
  // 24-block score bar colored by threshold
  const filled = Math.round((trust.score / 100) * 24)
  const scoreBar =
    barColor(trust.score)('▰'.repeat(filled)) +
    chalk.hex('#1e293b')('▱'.repeat(24 - filled))

  console.log('')
  console.log(SEP)
  console.log(chalk.white.bold('  Vouqis Trust Score Report'))
  console.log(SEP)
  console.log(`  ${label('Server')}       ${blue(serverUrl)}`)
  console.log(`  ${label('Score')}        ${chalk.white(`${trust.score} / 100`)}  ${scoreBar}`)
  console.log(
    `  ${label('Pass rate')}    ${chalk.white(`${(trust.passRate * 100).toFixed(1)}%`)}` +
      ` (${trust.passedPrompts}/${trust.totalPrompts} prompts)`,
  )
  console.log(
    `  ${label('P50 latency')}  ${chalk.white(`${trust.p50LatencyMs}ms`)}  ${dim('(target: <500ms)')}`,
  )

  // Group failures by mode, keep first occurrence for tool/latency detail
  const failuresByMode = results
    .filter((r) => !r.passed)
    .reduce<Record<string, EvalResult[]>>((acc, r) => {
      if (!acc[r.failureMode]) acc[r.failureMode] = []
      acc[r.failureMode].push(r)
      return acc
    }, {})

  if (Object.keys(failuresByMode).length > 0) {
    console.log('')
    console.log(`  ${label('Errors by category:')}`)
    for (const [mode, failures] of Object.entries(failuresByMode)) {
      const count = failures.length
      const first = failures[0]
      const detail = first.toolCalled
        ? `${blue(first.toolCalled)} ${dim(`(${first.durationMs}ms)`)}`
        : dim(first.errorText?.slice(0, 50) ?? 'error')
      const dots = dim('·'.repeat(Math.max(4, 22 - mode.length)))
      const plural = count === 1 ? 'failure' : 'failures'
      console.log(`  ${red('✗')} ${mode} ${dots} ${chalk.white(`${count} ${plural}`)}  ${detail}`)
    }
  }

  console.log('')
  console.log(SEP)
  console.log(`  ${label('report written →')} ${chalk.white(reportPath)}`)
  console.log(`  ${label('view traces:')}     ${blue('https://vouqis.vercel.app')}`)
  console.log('')
}
