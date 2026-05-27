import {Args, Command, Flags} from '@oclif/core'
import ora from 'ora'
import {McpClient} from '../mcp/client.js'
import {runEval} from '../eval/harness.js'
import {DEFAULT_PROMPTS} from '../eval/prompts.js'
import {computeTrustScore} from '../eval/scoring.js'
import {printHeader, printDiscovery, formatProgress, printTrustScore, printProCallout} from '../output/terminal.js'
import {buildJsonReport, writeJsonReport} from '../output/json.js'

export default class Score extends Command {
  static override description =
    'Score an MCP server reliability and return a trust score from 0 to 100'

  static override examples = [
    '<%= config.bin %> score https://your-mcp-server.example.com',
  ]

  static override args = {
    url: Args.string({
      description: 'URL of the MCP server to score',
      required: true,
    }),
  }

  static override flags = {
    'json-path': Flags.string({
      description: 'File path to write JSON report',
      default: './vouqis-report.json',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Score)
    const dashboardUrl = process.env.VOUQIS_DASHBOARD_URL || 'https://vouqis.tech'
    const apiKey = process.env.VOUQIS_API_KEY
    const isPro = !!apiKey

    printHeader(args.url)

    const spinner = ora('  discovering tools…').start()
    const client = new McpClient(args.url)

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

    const trust = computeTrustScore(results)
    const reportPath = flags['json-path']

    printTrustScore(args.url, trust, results, reportPath)

    const report = buildJsonReport(args.url, trust, results)
    writeJsonReport(report, reportPath)

    let reportUrl: string | undefined
    try {
      const headers: Record<string, string> = {'Content-Type': 'application/json'}
      if (apiKey) headers['X-Vouqis-Api-Key'] = apiKey

      const score = trust.score
      const verdict = score >= 80 ? 'APPROVED' : score >= 50 ? 'RISKY' : 'DO NOT INTEGRATE'

      const res = await fetch(`${dashboardUrl}/api/reports`, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          serverUrl: args.url,
          trustScore: score,
          verdict,
          passCount: trust.passedPrompts,
          failCount: trust.totalPrompts - trust.passedPrompts,
          latencyP50: trust.p50LatencyMs,
          topFailures: trust.errorsByFailureMode,
          probeResults: results,
        }),
      })
      if (res.ok) {
        const json = await res.json() as {reportUrl?: string}
        reportUrl = json.reportUrl
      }
    } catch {
      // Non-fatal — CLI works without dashboard connectivity
    }

    printProCallout(isPro, reportUrl)
  }
}
