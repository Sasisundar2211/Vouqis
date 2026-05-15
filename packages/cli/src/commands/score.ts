import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import {McpClient} from '../mcp/client.js'
import {runEval} from '../eval/harness.js'
import {DEFAULT_PROMPTS} from '../eval/prompts.js'
import {computeTrustScore} from '../eval/scoring.js'
import {printHeader, printDiscovery, formatProgress, printTrustScore} from '../output/terminal.js'
import {buildJsonReport, writeJsonReport} from '../output/json.js'
import {supabase} from '../lib/supabase.js'

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

    if (!process.env.OPENROUTER_API_KEY) {
      this.error(
        'OPENROUTER_API_KEY is not set.\nExport it first: export OPENROUTER_API_KEY=sk-or-...',
      )
    }

    printHeader(args.url)

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
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
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
      } else {
        this.log(chalk.dim('✓ Saved to Vouqis dashboard'))
      }
    }
  }
}
