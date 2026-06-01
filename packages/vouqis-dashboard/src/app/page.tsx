export default function Page() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-10">

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Vouqis
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            MCP Server Trust Layer
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Run 10 behavioral probes against any MCP server and get a trust score, shareable report, and fix suggestions — in under 60 seconds.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Quick start
          </p>
          <div className="bg-muted rounded-lg px-4 py-3">
            <pre className="text-sm font-mono text-foreground overflow-x-auto leading-relaxed whitespace-pre-wrap">{`npm install -g @vouqis/cli
vouqis audit https://your-mcp-server`}</pre>
          </div>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The CLI runs 10 probes across 5 failure modes — malformed JSON-RPC, missing parameters, timeouts, schema compliance, and null arguments — and uploads a shareable report.
          </p>
          <p>
            <a
              href="https://github.com/Sasisundar2211/Vouqis"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              View source on GitHub →
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
