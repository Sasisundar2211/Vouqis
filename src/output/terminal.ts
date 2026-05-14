import chalk, {type ChalkInstance} from 'chalk'
import type {TrustScore} from '../eval/scoring.js'
import type {EvalResult} from '../eval/scoring.js'

function scoreColor(score: number): ChalkInstance {
  if (score >= 80) return chalk.green
  if (score >= 60) return chalk.yellow
  return chalk.red
}

function bar(value: number, max = 100, width = 20): string {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export function printTrustScore(
  serverUrl: string,
  trust: TrustScore,
  results: EvalResult[],
): void {
  const color = scoreColor(trust.score)

  console.log('')
  console.log(chalk.bold('Vouqis Trust Score Report'))
  console.log(chalk.dim('─'.repeat(52)))
  console.log(`  Server:      ${chalk.cyan(serverUrl)}`)
  console.log(
    `  Score:       ${color.bold(String(trust.score))} / 100  ${color(bar(trust.score))}`,
  )
  console.log(
    `  Pass rate:   ${(trust.passRate * 100).toFixed(1)}%  (${trust.passedPrompts}/${trust.totalPrompts} prompts)`,
  )
  console.log(`  P50 latency: ${trust.p50LatencyMs}ms`)

  const failures = results.filter((r) => !r.passed && r.errorText)

  if (failures.length > 0) {
    console.log('')
    console.log(chalk.bold('  Top failures:'))
    for (const f of failures.slice(0, 3)) {
      const tool = f.toolCalled ? chalk.cyan(f.toolCalled) + ' → ' : ''
      console.log(`    ${chalk.red('✗')} [${chalk.dim(f.promptId)}] ${tool}${f.errorText}`)
    }
  }

  if (Object.keys(trust.errorsByFailureMode).length > 0) {
    console.log('')
    console.log(chalk.bold('  Failures by mode:'))
    for (const [mode, count] of Object.entries(trust.errorsByFailureMode)) {
      console.log(`    ${chalk.red('✗')} ${mode}: ${count} failure${count === 1 ? '' : 's'}`)
    }
  }

  console.log(chalk.dim('─'.repeat(52)))
  console.log('')
}
