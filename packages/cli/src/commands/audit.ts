import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import {McpClient} from '../mcp/client.js'
import {runEval} from '../eval/harness.js'
import {DEFAULT_PROMPTS} from '../eval/prompts.js'
import {computeTrustScore} from '../eval/scoring.js'
import {printDiscovery, formatProgress, printTrustScore, printProCallout} from '../output/terminal.js'
import {buildJsonReport, writeJsonReport} from '../output/json.js'

const SEP = chalk.hex('#475569')('─'.repeat(50))
const blue = chalk.hex('#60a5fa')

const APPROVED_THRESHOLD = parseInt(process.env.VOUQIS_APPROVED_THRESHOLD || '80')
const RISKY_THRESHOLD = parseInt(process.env.VOUQIS_RISKY_THRESHOLD || '50')

function getVerdict(score: number): 'APPROVED' | 'RISKY' | 'DO NOT INTEGRATE' {
  if (score >= APPROVED_THRESHOLD) return 'APPROVED'
  if (score >= RISKY_THRESHOLD) return 'RISKY'
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
    console.log(chalk.bold.green('  ✓ APPROVED — this server passed all reliability tests'))
  } else if (verdict === 'RISKY') {
    console.log(chalk.bold.yellow('  ⚠ RISKY — some tests failed, review before going to production'))
  } else {
    console.log(chalk.bold.red('  ✗ DO NOT INTEGRATE — too many failures to trust in production'))
  }
  console.log('')
}

export default class Audit extends Command {
  static override description =
    'Audit an MCP server and get a trust verdict: APPROVED, RISKY, or DO NOT INTEGRATE'

  static override examples = [
    '<%= config.bin %> audit https://your-mcp-server.example.com',
    '<%= config.bin %> audit https://your-mcp-server.example.com --fail-below 80',
    '<%= config.bin %> audit https://your-mcp-server.example.com --header "Authorization: Bearer TOKEN"',
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
      description: '[PRO] Exit with code 1 if trust score is below this threshold (requires VOUQIS_API_KEY for CI/CD)',
    }),
    header: Flags.string({
      description: 'Extra HTTP header to send (format: "Key: Value"). Repeatable.',
      multiple: true,
      char: 'H',
    }),
    report: Flags.boolean({
      description: 'Upload results to vouqis.tech and generate a shareable URL',
      default: true,
      allowNo: true,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Audit)
    const dashboardUrl = process.env.VOUQIS_DASHBOARD_URL || 'https://vouqis.tech'
    const apiKey = process.env.VOUQIS_API_KEY
    const isPro = !!apiKey

    printAuditHeader(args.url)

    const spinner = ora('  discovering tools…').start()

    const extraHeaders: Record<string, string> = {}
    for (const raw of flags.header ?? []) {
      const colon = raw.indexOf(':')
      if (colon === -1) {
        spinner.warn(`Ignoring malformed header (expected "Key: Value"): ${raw}`)
        continue
      }
      extraHeaders[raw.slice(0, colon).trim()] = raw.slice(colon + 1).trim()
    }

    const client = new McpClient(args.url, extraHeaders)

    let tools: Awaited<ReturnType<McpClient['connect']>>
    try {
      tools = await client.connect()
      spinner.stop()
      printDiscovery(tools.length, DEFAULT_PROMPTS.length, args.url)
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

    const trust = computeTrustScore(results, DEFAULT_PROMPTS)
    const reportPath = flags['json-path']

    printTrustScore(args.url, trust, results, reportPath)
    printVerdict(trust.score)

    const report = buildJsonReport(args.url, trust, results)
    writeJsonReport(report, reportPath)

    let reportUrl: string | undefined
    if (apiKey || flags['report']) {
      try {
        const headers: Record<string, string> = {'Content-Type': 'application/json'}
        if (apiKey) headers['X-Vouqis-Api-Key'] = apiKey

        const reportRes = await fetch(`${dashboardUrl}/api/reports`, {
          method: 'POST',
          headers,
          signal: AbortSignal.timeout(5000),
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
          const json = await reportRes.json() as {reportUrl?: string}
          reportUrl = json.reportUrl
        }
      } catch {
        // Non-fatal — CLI works without dashboard connectivity
      }
    }

    printProCallout(isPro, reportUrl)

    if (flags['fail-below'] !== undefined && trust.score < flags['fail-below']) {
      this.exit(1)
    }
  }
}
