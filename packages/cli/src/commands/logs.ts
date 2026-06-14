import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as readline from 'node:readline'
import chalk from 'chalk'
import type {AuditEvent} from '../proxy/types.js'
import {distinctId, posthog} from '../analytics.js'

const SEP = chalk.hex('#475569')('─'.repeat(50))

export default class Logs extends Command {
  static override description =
    'View and summarise the Vouqis proxy audit log'

  static override examples = [
    '<%= config.bin %> logs',
    '<%= config.bin %> logs --tail 50',
    '<%= config.bin %> logs --file ./my-audit.log',
  ]

  static override flags = {
    tail: Flags.integer({
      description: 'Show last N events',
      default: 20,
      char: 'n',
    }),
    file: Flags.string({
      description: 'Path to audit log file',
      default: './vouqis-audit.log',
      char: 'f',
    }),
    summary: Flags.boolean({
      description: 'Print stats only, no event rows',
      default: false,
      char: 's',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Logs)

    if (!fs.existsSync(flags.file)) {
      this.log(chalk.dim(`No audit log found at ${flags.file}.`))
      this.log(chalk.dim('Start the proxy first: vouqis proxy --upstream <url>'))
      return
    }

    const events = await this.readEvents(flags.file)

    posthog.capture({
      distinctId,
      event: 'logs_command_run',
      properties: {event_count: events.length, summary_mode: flags.summary},
    })
    await posthog.shutdown()

    if (events.length === 0) {
      this.log(chalk.dim('Audit log is empty.'))
      return
    }

    // ── Summary stats ─────────────────────────────────────────────────────────
    const counts: Record<string, number> = {allow: 0, block: 0, retry: 0, rewrite: 0}
    const methodCounts: Record<string, number> = {}
    const blockReasons: Record<string, number> = {}
    const latencies: number[] = []

    for (const e of events) {
      counts[e.decision] = (counts[e.decision] ?? 0) + 1
      methodCounts[e.method] = (methodCounts[e.method] ?? 0) + 1
      latencies.push(e.latency_ms)
      if (e.decision === 'block' && e.reason) {
        blockReasons[e.reason] = (blockReasons[e.reason] ?? 0) + 1
      }
    }

    latencies.sort((a, b) => a - b)
    const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0
    const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0

    console.log('')
    console.log(chalk.bold.white('VOUQIS') + chalk.hex('#475569')(' ── audit log summary'))
    console.log(SEP)
    console.log('')
    console.log(`  Total events   ${chalk.white(String(events.length))}`)
    console.log(`  Allowed        ${chalk.green(String(counts['allow'] ?? 0))}`)
    console.log(`  Blocked        ${counts['block'] ? chalk.red(String(counts['block'])) : chalk.dim('0')}`)
    console.log(`  Retried        ${counts['retry'] ? chalk.yellow(String(counts['retry'])) : chalk.dim('0')}`)
    console.log(`  Rewritten      ${counts['rewrite'] ? chalk.yellow(String(counts['rewrite'])) : chalk.dim('0')}`)
    console.log(`  Latency P50    ${chalk.white(String(p50))}ms`)
    console.log(`  Latency P95    ${chalk.white(String(p95))}ms`)

    if (Object.keys(methodCounts).length > 0) {
      console.log('')
      console.log(chalk.dim('  Top methods:'))
      for (const [m, c] of Object.entries(methodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
        console.log(`    ${chalk.dim(m.padEnd(24))} ${c}`)
      }
    }

    if (Object.keys(blockReasons).length > 0) {
      console.log('')
      console.log(chalk.dim('  Top block reasons:'))
      for (const [r, c] of Object.entries(blockReasons).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
        const label = r.length > 60 ? r.slice(0, 60) + '…' : r
        console.log(`    ${chalk.red('✗')} ${label} (${c})`)
      }
    }

    if (!flags.summary) {
      const tail = events.slice(-flags.tail)
      console.log('')
      console.log(chalk.dim(`  Last ${tail.length} events:`))
      console.log('')
      for (const e of tail) {
        const badge = this.badge(e.decision)
        const ts = new Date(e.timestamp).toLocaleTimeString()
        const target = e.tool ?? e.method
        const latency = chalk.dim(`${e.latency_ms}ms`)
        const reason = e.reason ? chalk.dim(` — ${e.reason.slice(0, 60)}`) : ''
        console.log(`  ${badge} ${chalk.dim(ts)} ${chalk.white(target.padEnd(24))} ${latency}${reason}`)
      }
    }

    console.log('')
    console.log(SEP)
    console.log('')
  }

  private badge(decision: AuditEvent['decision']): string {
    switch (decision) {
      case 'block':   return chalk.red('✗ block  ')
      case 'retry':   return chalk.yellow('↺ retry  ')
      case 'rewrite': return chalk.yellow('~ rewrite')
      default:        return chalk.green('✓ allow  ')
    }
  }

  private async readEvents(file: string): Promise<AuditEvent[]> {
    const events: AuditEvent[] = []
    const rl = readline.createInterface({input: fs.createReadStream(file), crlfDelay: Infinity})
    for await (const line of rl) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        events.push(JSON.parse(trimmed) as AuditEvent)
      } catch {
        // skip malformed lines
      }
    }
    return events
  }
}
