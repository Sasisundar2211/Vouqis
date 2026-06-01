import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import chalk from 'chalk'
import {loadConfigFile, inlineConfig} from '../proxy/config.js'
import {AuditLogger} from '../proxy/audit.js'
import {createProxyServer, startServer} from '../proxy/server.js'

const SEP = chalk.hex('#475569')('─'.repeat(50))
const blue = chalk.hex('#60a5fa')

export default class Proxy extends Command {
  static override description =
    'Start a runtime MCP proxy — validates, rate-limits, retries, and audits every request'

  static override examples = [
    '<%= config.bin %> proxy --upstream https://your-mcp-server.example.com',
    '<%= config.bin %> proxy --upstream https://your-mcp-server.example.com --listen 127.0.0.1:8787',
    '<%= config.bin %> proxy --config vouqis.yml',
  ]

  static override args = {
    upstream: Args.string({
      description: 'Target MCP server URL (alternative to --config)',
      required: false,
    }),
  }

  static override flags = {
    upstream: Flags.string({
      description: 'Target MCP server URL',
      char: 'u',
    }),
    listen: Flags.string({
      description: 'Local address to bind (host:port or just port)',
      default: '127.0.0.1:4444',
      char: 'l',
    }),
    timeout: Flags.integer({
      description: 'Upstream timeout in ms',
      default: 5000,
      char: 't',
    }),
    retry: Flags.integer({
      description: 'Max retries on timeout (idempotent requests only)',
      default: 1,
    }),
    'rate-limit': Flags.integer({
      description: 'Max requests per second to upstream',
    }),
    'log-file': Flags.string({
      description: 'Audit log output path',
      default: './vouqis-audit.log',
    }),
    'no-block-null': Flags.boolean({
      description: 'Allow null/empty tool call results through',
      default: false,
    }),
    'no-sanitize': Flags.boolean({
      description: 'Disable schema normalization',
      default: false,
    }),
    config: Flags.string({
      description: 'Path to vouqis.yml config file',
      char: 'c',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Proxy)

    // Config resolution: --config file > inline flags > auto-detect vouqis.yml
    let config
    const configPath = flags.config ?? (fs.existsSync('./vouqis.yml') ? './vouqis.yml' : null)

    if (configPath) {
      try {
        config = loadConfigFile(configPath)
      } catch (err) {
        this.error(`Failed to load config from ${configPath}: ${err instanceof Error ? err.message : String(err)}`)
      }
    } else {
      const upstreamUrl = flags.upstream ?? args.upstream
      if (!upstreamUrl) {
        this.error(
          'Provide a target MCP server: vouqis proxy --upstream https://your-mcp-server.com\n' +
          'Or create a vouqis.yml config file and run vouqis proxy',
        )
      }
      config = inlineConfig({
        upstream: upstreamUrl,
        listen: flags.listen,
        timeoutMs: flags.timeout,
        retry: flags.retry,
        rateLimitRps: flags['rate-limit'],
        logFile: flags['log-file'],
        blockNull: !flags['no-block-null'],
        sanitize: !flags['no-sanitize'],
      })
    }

    const upstream = config.upstreams[0]
    const logger = new AuditLogger(config.log_file)
    const server = createProxyServer(config, logger)

    try {
      await startServer(server, config.listen)
    } catch (err) {
      this.error(`Failed to start proxy: ${err instanceof Error ? err.message : String(err)}`)
    }

    console.log('')
    console.log(chalk.bold.white('VOUQIS') + chalk.hex('#475569')(' ── proxy ── ') + blue(upstream.url))
    console.log(SEP)
    console.log('')
    console.log(`  Listening on   ${chalk.bold.white(`http://${config.listen}`)}`)
    console.log(`  Upstream       ${blue(upstream.url)}`)
    console.log(`  Timeout        ${chalk.white(String(upstream.timeout_ms))}ms`)
    console.log(`  Retry          ${chalk.white(String(upstream.retry))} (idempotent requests)`)
    if (upstream.rate_limit_rps) {
      console.log(`  Rate limit     ${chalk.white(String(upstream.rate_limit_rps))} req/s`)
    }
    console.log(`  Block null     ${upstream.policies.block_null_result ? chalk.green('yes') : chalk.dim('no')}`)
    console.log(`  Sanitize       ${upstream.policies.sanitize_schema ? chalk.green('yes') : chalk.dim('no')}`)
    console.log(`  Audit log      ${chalk.dim(config.log_file)}`)
    console.log('')
    console.log(chalk.dim('  Point your agent at http://' + config.listen + ' instead of the real server.'))
    console.log(chalk.dim('  Every decision is logged to stderr and to ' + config.log_file + '.'))
    console.log('')
    console.log(SEP)
    console.log('')

    await new Promise<void>((resolve) => {
      const shutdown = () => {
        console.log('\n' + chalk.dim('  Proxy stopped.'))
        logger.close()
        server.close()
        resolve()
      }
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    })
  }
}
