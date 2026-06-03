import * as fs from 'node:fs'
import chalk from 'chalk'
import type {AuditEvent} from './types.js'

export class AuditLogger {
  private readonly stream: fs.WriteStream
  private readonly dashboardUrl: string | null
  private readonly apiKey: string | null

  constructor(logFile: string, dashboardUrl?: string, apiKey?: string) {
    this.stream = fs.createWriteStream(logFile, {flags: 'a'})
    this.dashboardUrl = dashboardUrl ?? null
    this.apiKey = apiKey ?? null
  }

  log(event: AuditEvent): void {
    const line = JSON.stringify(event)
    this.stream.write(line + '\n')
    this.printToStderr(event)
    if (this.dashboardUrl && this.apiKey) {
      this.uploadToDashboard(event)
    }
  }

  close(): void {
    this.stream.end()
  }

  private uploadToDashboard(event: AuditEvent): void {
    fetch(`${this.dashboardUrl}/api/events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(4000),
    }).catch(() => {
      // fire-and-forget — never affect proxy behaviour
    })
  }

  private printToStderr(event: AuditEvent): void {
    const time = event.timestamp.slice(11, 19) // HH:MM:SS
    const decision = this.colorDecision(event.decision)
    const method = chalk.dim(event.method.padEnd(12))
    const tool = event.tool ? chalk.white(event.tool.padEnd(24)) : ' '.repeat(24)
    const latency = chalk.dim(`${event.latency_ms}ms`)
    const reason = event.reason ? chalk.dim(`  ← ${event.reason}`) : ''
    process.stderr.write(`  [${chalk.dim(time)}]  ${decision}  ${method}  ${tool}  ${latency}${reason}\n`)
  }

  private colorDecision(decision: AuditEvent['decision']): string {
    const label = decision.toUpperCase().padEnd(7)
    switch (decision) {
      case 'block':   return chalk.red(label)
      case 'retry':   return chalk.yellow(label)
      case 'rewrite': return chalk.yellow(label)
      default:        return chalk.green(label)
    }
  }
}
