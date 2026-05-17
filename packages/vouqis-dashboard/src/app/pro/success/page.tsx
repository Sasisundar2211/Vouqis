export default function ProSuccessPage() {
  return (
    <main
      style={{backgroundColor: '#0d0d0d', color: '#e2e8f0'}}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-5xl">✓</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-mono" style={{color: '#4ade80'}}>
            You&apos;re on Pro
          </h1>
          <p className="text-sm" style={{color: '#94a3b8'}}>
            Your subscription is active. Run unlimited audits and share private reports with your team.
          </p>
        </div>
        <div
          className="rounded-lg border p-5 text-left space-y-2"
          style={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
        >
          <p className="text-xs font-mono uppercase tracking-widest" style={{color: '#64748b'}}>
            Next step
          </p>
          <p className="font-mono text-sm" style={{color: '#e2e8f0'}}>
            npm install -g @vouqis/cli &amp;&amp; vouqis audit &lt;your-mcp-url&gt;
          </p>
        </div>
        <a
          href="/"
          className="inline-block text-sm font-mono underline"
          style={{color: '#60a5fa'}}
        >
          ← Back to dashboard
        </a>
      </div>
    </main>
  )
}
