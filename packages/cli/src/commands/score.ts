import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'
import {McpClient} from '../mcp/client.js'
import {runEval} from '../eval/harness.js'
import {DEFAULT_PROMPTS} from '../eval/prompts.js'
import {computeTrustScore} from '../eval/scoring.js'
import {printTrustScore} from '../output/terminal.js'
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

    const spinner = ora('Connecting to MCP server…').start()
    const client = new McpClient(args.url)

    let tools: Awaited<ReturnType<McpClient['connect']>>
    try {
      tools = await client.connect()
      spinner.succeed(`Connected — ${tools.length} tool${tools.length === 1 ? '' : 's'} found`)
    } catch (err: unknown) {
      spinner.fail('Could not connect to MCP server')
      this.error(err instanceof Error ? err.message : String(err))
    }

    let completed = 0
    spinner.start(`Running probes… 0 / ${DEFAULT_PROMPTS.length}`)

    const results = await runEval({
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      mcpClient: client,
      tools,
      prompts: DEFAULT_PROMPTS,
      onProgress: (r) => {
        completed++
        const status = r.passed ? '✓' : '✗'
        spinner.text = `Running probes… ${completed} / ${DEFAULT_PROMPTS.length}  (${status} ${r.promptId})`
      },
    })

    spinner.succeed(`All ${DEFAULT_PROMPTS.length} probes complete`)

    await client.disconnect()

    const trust = computeTrustScore(results)
    printTrustScore(args.url, trust, results)

    const report = buildJsonReport(args.url, trust, results)
    writeJsonReport(report, flags['json-path'])
    this.log(`JSON report written → ${flags['json-path']}`)

    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
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
