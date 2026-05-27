import chalk from 'chalk'
import type {TrustScore, EvalResult} from '../eval/scoring.js'

export const MCP_PROTOCOL = '2025-06-18'

const DASHBOARD_URL = 'https://vouqis.tech'

// ── Color palette ─────────────────────────────────────────────────────────────
const SEP = chalk.hex('#475569')('─'.repeat(50))
const dim = chalk.hex('#475569')
const label = chalk.hex('#64748b')
const blue = chalk.hex('#60a5fa')
const green = chalk.hex('#4ade80')
const red = chalk.hex('#f87171')
const yellow = chalk.hex('#fbbf24')

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

// ── Section 2: Discovery (shown after connect) ────────────────────────────────

export function printDiscovery(toolCount: number, totalProbes: number, serverUrl: string): void {
  console.log(
    `  ${green('✓')} Connected — found ${chalk.white(String(toolCount))} tool${toolCount === 1 ? '' : 's'}`,
  )
  console.log(`  Running ${chalk.white(String(totalProbes))} reliability tests against ${blue(serverUrl)}`)
  console.log('')
}

// ── Section 3: Progress bar (returned as string for ora .text) ────────────────

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

// ── Section 4: Trust score report ────────────────────────────────────────────

export function printTrustScore(
  serverUrl: string,
  trust: TrustScore,
  results: EvalResult[],
  reportPath = './vouqis-report.json',
): void {
  const filled = Math.round((trust.score / 100) * 24)
  const scoreBar =
    barColor(trust.score)('▰'.repeat(filled)) +
    chalk.hex('#1e293b')('▱'.repeat(24 - filled))

  console.log('')
  console.log(SEP)
  console.log(chalk.white.bold('  Vouqis Trust Score Report'))
  console.log(SEP)
  console.log(`  ${label('Server')}          ${blue(serverUrl)}`)
  console.log(`  ${label('Score')}           ${chalk.white(`${trust.score} / 100`)}  ${scoreBar}`)
  console.log(
    `  ${label('Tests passed')}    ${chalk.white(`${trust.passedPrompts} of ${trust.totalPrompts}`)}` +
      `  ${dim(`(${(trust.passRate * 100).toFixed(0)}%)`)}`,
  )
  console.log(
    `  ${label('Response time')}   ${chalk.white(`${trust.p50LatencyMs}ms`)}  ${dim('typical · target <500ms')}`,
  )

  const FAILURE_LABELS: Record<string, string> = {
    'malformed-jsonrpc': 'Did not reject invalid requests',
    'missing-params':    'Ignored missing required inputs',
    'timeout':           'Too slow — timed out',
    'unexpected-schema': 'Returned unexpected response format',
    'null-response':     'Returned empty or null results',
  }

  const failuresByMode = results
    .filter((r) => !r.passed)
    .reduce<Record<string, EvalResult[]>>((acc, r) => {
      if (!acc[r.failureMode]) acc[r.failureMode] = []
      acc[r.failureMode].push(r)
      return acc
    }, {})

  if (Object.keys(failuresByMode).length > 0) {
    console.log('')
    console.log(`  ${label('What failed:')}`)
    for (const [mode, failures] of Object.entries(failuresByMode)) {
      const count = failures.length
      const first = failures[0]
      const humanLabel = FAILURE_LABELS[mode] ?? mode
      const detail = first.toolCalled
        ? dim(` (tool: ${first.toolCalled}, ${first.durationMs}ms)`)
        : dim(first.errorText ? ` — ${first.errorText.slice(0, 50)}` : '')
      const times = count === 1 ? '1 time' : `${count} times`
      console.log(`  ${red('✗')} ${humanLabel} ${dim('·')} ${chalk.white(times)}${detail}`)
    }
  }

  console.log('')
  console.log(SEP)
  console.log(`  ${label('report written →')} ${chalk.white(reportPath)}`)
  console.log('')
}

// ── Section 5: Pro plan callout ────────────────────────────────────────────────
// Call this after the dashboard upload attempt — it knows reportUrl and isPro.

export function printProCallout(isPro: boolean, reportUrl?: string): void {
  if (reportUrl) {
    const retention = isPro ? '90 days' : '7 days'
    const planLabel = isPro ? green('⚡ Pro') : dim('[free]')
    console.log(`  ${label('Dashboard')}      ${planLabel}  ${dim(`· report kept for ${retention}`)}`)
    console.log(`  ${label('Share link')}     ${blue(reportUrl)}`)
    console.log('')
  }

  if (isPro) {
    console.log(`  ${green('⚡')} ${dim('Pro active · 90-day history · CI/CD ready')}`)
    console.log('')
    return
  }

  // Free user upgrade prompt
  console.log(SEP)
  console.log(`  ${yellow('⚡ Unlock Pro')} ${dim('— $9/mo · first 50 users lock in forever')}`)
  console.log(SEP)
  console.log(`  ${dim('[PRO]')}  ${chalk.white('90-day report history')}  ${dim('you get 7 days on free')}`)
  console.log(`  ${dim('[PRO]')}  ${chalk.white('CI/CD API key')}          ${dim('block deploys on low trust score')}`)
  console.log(`  ${dim('[PRO]')}  ${chalk.white('--fail-below gate')}      ${dim('fail builds automatically')}`)
  console.log(`  ${dim('[PRO]')}  ${chalk.white('Private report links')}   ${dim('team-only sharing (coming soon)')}`)
  console.log('')
  console.log(`  Set ${chalk.cyan('VOUQIS_API_KEY=<your-key>')} to activate Pro`)
  console.log(`  Get your key: ${blue(`${DASHBOARD_URL}/pro`)}`)
  console.log('')
}
