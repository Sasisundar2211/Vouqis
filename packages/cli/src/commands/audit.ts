import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import {McpClient} from '../mcp/client.js'
import {runEval} from '../eval/harness.js'
import {DEFAULT_PROMPTS} from '../eval/prompts.js'
import {computeTrustScore} from '../eval/scoring.js'
import {printDiscovery, formatProgress, printTrustScore} from '../output/terminal.js'
import {buildJsonReport, writeJsonReport} from '../output/json.js'
import {supabase} from '../lib/supabase.js'

const SEP = chalk.hex('#475569')('─'.repeat(50))
const blue = chalk.hex('#60a5fa')
const green = chalk.hex('#4ade80')

function getVerdict(score: number): 'APPROVED' | 'RISKY' | 'DO NOT INTEGRATE' {
  if (score >= 80) return 'APPROVED'
  if (score >= 50) return 'RISKY'
  return 'DO NOT INTEGRATE'
}

function printAuditHeader(serverUrl: string): void {
  console.log('')
  console.log(chalk.bold.white('VOUQIS') + chalk.hex('#475569')(' ── audit ── ') + blue(serverUrl))
  console.log(SEP)
  console.log('')
}

function printVerdict(score: number): void {
  const verdict = getVerdict(score)
  if (verdict === 'APPROVED') {
    console.log(chalk.bold.green('  ✓ APPROVED — safe to integrate'))
  } else if (verdict === 'RISKY') {
    console.log(chalk.bold.yellow('  ⚠ RISKY — review failures before integrating'))
  } else {
    console.log(chalk.bold.red('  ✗ DO NOT INTEGRATE — critical failures detected'))
  }
  console.log('')
}

export default class Audit extends Command {
  static override description =
    'Audit an MCP server and get a trust verdict: APPROVED, RISKY, or DO NOT INTEGRATE'

  static override examples = [
    '<%= config.bin %> audit https://your-mcp-server.example.com',
    '<%= config.bin %> audit https://your-mcp-server.example.com --fail-below 80',
  ]

  static override args = {
    url: Args.string({
      description: 'URL of the MCP server to audit',
      required: true,
    }),
  }

  static override flags = {
    'json-path': Flags.string({
      description: 'File path to write JSON report',
      default: './vouqis-report.json',
    }),
    'fail-below': Flags.integer({
      description: 'Exit with code 1 if trust score is below this threshold',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Audit)

    printAuditHeader(args.url)

    const spinner = ora('  discovering tools…').start()
    const client = new McpClient(args.url)

    let tools: Awaited<ReturnType<McpClient['connect']>>
    try {
      tools = await client.connect()
      spinner.stop()
      printDiscovery(tools.length, DEFAULT_PROMPTS.length)
    } catch (err: unknown) {
      spinner.fail('Could not connect to MCP server')
      this.error(err instanceof Error ? err.message : String(err))
    }

    let completed = 0
    let passed = 0
    let failed = 0

    spinner.start(formatProgress(0, DEFAULT_PROMPTS.length, 0, 0))

    const results = await runEval({
      mcpClient: client,
      tools,
      prompts: DEFAULT_PROMPTS,
      onProgress: (r) => {
        completed++
        if (r.passed) passed++
        else failed++
        spinner.text = formatProgress(completed, DEFAULT_PROMPTS.length, passed, failed)
      },
    })

    spinner.stop()

    await client.disconnect()

    const trust = computeTrustScore(results)
    const reportPath = flags['json-path']

    printTrustScore(args.url, trust, results, reportPath)
    printVerdict(trust.score)

    const report = buildJsonReport(args.url, trust, results)
    writeJsonReport(report, reportPath)

    {
      const {error: dbError} = await supabase.from('eval_results').insert({
        server_url: args.url,
        trust_score: trust.score,
        pass_count: trust.passedPrompts,
        fail_count: trust.totalPrompts - trust.passedPrompts,
        latency_p50: trust.p50LatencyMs,
        top_failures: trust.errorsByFailureMode,
        probe_results: results,
      })

      if (dbError) {
        this.log(chalk.dim(`Warning: failed to save to dashboard: ${dbError.message}`))
      }
    }

    try {
      const apiBase = process.env.VOUQIS_API_URL ?? 'https://vouqis.vercel.app'
      const reportRes = await fetch(`${apiBase}/api/reports`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          serverUrl: args.url,
          trustScore: trust.score,
          verdict: getVerdict(trust.score),
          passCount: trust.passedPrompts,
          failCount: trust.totalPrompts - trust.passedPrompts,
          latencyP50: trust.p50LatencyMs,
          topFailures: trust.errorsByFailureMode,
          probeResults: results,
        }),
      })
      if (reportRes.ok) {
        const {url: reportUrl} = await reportRes.json() as {url: string}
        this.log('')
        this.log(chalk.dim('Shareable report: ') + chalk.cyan(reportUrl))
      }
    } catch {
      // Non-fatal: dashboard unavailable, CLI still exits normally
    }

    if (flags['fail-below'] !== undefined && trust.score < flags['fail-below']) {
      this.exit(1)
    }
  }
}
