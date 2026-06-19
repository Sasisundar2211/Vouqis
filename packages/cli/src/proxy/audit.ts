import * as fs from 'node:fs'
import chalk from 'chalk'
import type {AuditEvent} from './types.js'

export class AuditLogger {
  private readonly stream: fs.WriteStream

  constructor(logFile: string) {
    this.stream = fs.createWriteStream(logFile, {flags: 'a'})
  }

  log(event: AuditEvent): void {
    this.stream.write(JSON.stringify(event) + '\n')
    this.printToStderr(event)
  }

  close(): void {
    this.stream.end()
  }

  private printToStderr(event: AuditEvent): void {
    const time = event.timestamp.slice(11, 19) // HH:MM:SS
    const decision = this.colorDecision(event.decision)
    const rawMethod = event.method.length > 14 ? event.method.slice(0, 13) + '…' : event.method
    const method = chalk.dim(rawMethod.padEnd(14))
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
