import * as fs from 'node:fs'
import chalk from 'chalk'
import type {AuditEvent} from './types.js'

export class AuditLogger {
  private readonly stream: fs.WriteStream

  constructor(logFile: string) {
    this.stream = fs.createWriteStream(logFile, {flags: 'a'})
  }

  log(event: AuditEvent): void {
    const line = JSON.stringify(event)
    this.stream.write(line + '\n')
    this.printToStderr(event, line)
  }

  close(): void {
    this.stream.end()
  }

  private printToStderr(event: AuditEvent, line: string): void {
    const prefix = this.formatPrefix(event.decision)
    process.stderr.write(prefix + ' ' + line + '\n')
  }

  private formatPrefix(decision: AuditEvent['decision']): string {
    switch (decision) {
      case 'block':   return chalk.red('[block]  ')
      case 'retry':   return chalk.yellow('[retry]  ')
      case 'rewrite': return chalk.yellow('[rewrite]')
      default:        return chalk.dim('[allow]  ')
    }
  }
}
