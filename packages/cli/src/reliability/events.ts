import * as fs from 'node:fs'
import chalk from 'chalk'
import type {PolicyDecision} from './policy.js'
import type {FailureClass} from './failure.js'

const INSPECT_NEXT: Record<FailureClass, string> = {
  invalid_json:      'Inspect the raw response body for malformed or truncated JSON.',
  invalid_jsonrpc:   'Verify the JSON-RPC envelope — jsonrpc version, id, and method fields.',
  schema_violation:  'Validate the tool response against the declared MCP schema.',
  timeout:           'Check upstream latency and consider raising the timeout configuration.',
  transport_error:   'Verify network connectivity and upstream server availability.',
  upstream_error:    'Inspect the upstream HTTP status and response body for details.',
  unknown:           'Capture the full request and response for manual inspection.',
}

export interface ReliabilityEvent {
  timestamp: string
  upstream: string
  server_id: string
  method: string
  tool?: string
  requestId?: string | number | null
  decision: PolicyDecision
  latency_ms: number
  reason?: string
  attempt: number
  failureClass?: FailureClass
  http_method?: string
  http_path?: string
}

export class ReliabilityLogger {
  private readonly stream: fs.WriteStream

  constructor(logFile: string) {
    this.stream = fs.createWriteStream(logFile, {flags: 'a'})
  }

  log(event: ReliabilityEvent): void {
    this.stream.write(JSON.stringify(event) + '\n')
    this.printToStderr(event)
  }

  close(): void {
    this.stream.end()
  }

  private printToStderr(event: ReliabilityEvent): void {
    if (event.decision === 'block') {
      this.printReceipt(event)
      return
    }
    const time = event.timestamp.slice(11, 19)
    const decision = this.colorDecision(event.decision)
    const rawMethod = event.method.length > 14 ? event.method.slice(0, 13) + '…' : event.method
    const method = chalk.dim(rawMethod.padEnd(14))
    const tool = event.tool ? chalk.white(event.tool.padEnd(24)) : ' '.repeat(24)
    const latency = chalk.dim(`${event.latency_ms}ms`)
    const reason = event.reason ? chalk.dim(`  ← ${event.reason}`) : ''
    process.stderr.write(`  [${chalk.dim(time)}]  ${decision}  ${method}  ${tool}  ${latency}${reason}\n`)
  }

  private printReceipt(event: ReliabilityEvent): void {
    const SEP = chalk.dim('  ' + '─'.repeat(48))
    const time = chalk.dim(event.timestamp.slice(11, 19))
    const lbl = (k: string) => chalk.dim(k.padEnd(16))
    const val = (v: string) => chalk.white(v)

    const lines: string[] = ['', SEP, `  ${chalk.red.bold('FAILURE')}  ${time}`, '']

    lines.push(`  ${lbl('Server')}${val(event.server_id)}`)
    if (event.tool) lines.push(`  ${lbl('Tool')}${val(event.tool)}`)
    if (event.method === 'unknown' && event.http_method) {
      lines.push(`  ${lbl('HTTP Method')}${val(event.http_method)}`)
      if (event.http_path) lines.push(`  ${lbl('Path')}${val(event.http_path)}`)
    }

    if (event.failureClass || event.reason) {
      lines.push('')
      if (event.failureClass) lines.push(`  ${lbl('Failure Class')}${val(event.failureClass)}`)
      if (event.reason) {
        const short = event.reason.length > 80 ? event.reason.slice(0, 79) + '…' : event.reason
        lines.push(`  ${lbl('Reason')}${chalk.dim(short)}`)
      }
      if (event.failureClass) {
        lines.push(`  ${lbl('Inspect Next')}${chalk.dim(INSPECT_NEXT[event.failureClass])}`)
      }
    }

    lines.push('')
    if (event.requestId != null) lines.push(`  ${lbl('Request ID')}${chalk.dim(String(event.requestId))}`)
    lines.push(SEP)
    lines.push('')

    process.stderr.write(lines.join('\n') + '\n')
  }

  private colorDecision(decision: ReliabilityEvent['decision']): string {
    const label = decision.toUpperCase().padEnd(7)
    switch (decision) {
      case 'block':   return chalk.red(label)
      case 'retry':   return chalk.yellow(label)
      case 'rewrite': return chalk.yellow(label)
      default:        return chalk.green(label)
    }
  }
}
