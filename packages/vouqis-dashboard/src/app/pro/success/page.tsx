import Link from 'next/link'
import {SetProPlan} from '@/components/SetProPlan'

export default function ProSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <SetProPlan />
      <div className="max-w-md w-full space-y-8">

        {/* Confirmation */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Vouqis Pro
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            You&apos;re on Pro
          </h1>
          <p className="text-sm text-muted-foreground">
            Your subscription is active. Your API key was sent to the email you used at checkout — check your inbox.
          </p>
        </div>

        {/* Step 1 — Install */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Step 1 — Install
          </p>
          <div className="bg-muted rounded-lg px-4 py-3">
            <pre className="text-xs font-mono text-foreground overflow-x-auto">npm install -g @vouqis/cli</pre>
          </div>
        </div>

        {/* Step 2 — Activate */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Step 2 — Activate Pro (from the email you received)
          </p>
          <div className="bg-muted rounded-lg px-4 py-3 space-y-1">
            <pre className="text-xs font-mono text-foreground overflow-x-auto leading-relaxed">{`export VOUQIS_API_KEY=your-key-here`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Add to <code className="font-mono">~/.zshrc</code> (or <code className="font-mono">~/.bashrc</code>) to persist across sessions.
            For CI, add it as a secret named <code className="font-mono">VOUQIS_API_KEY</code>.
          </p>
        </div>

        {/* Step 3 — Run */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Step 3 — Run an audit
          </p>
          <div className="bg-muted rounded-lg px-4 py-3">
            <pre className="text-xs font-mono text-foreground overflow-x-auto">vouqis audit &lt;your-mcp-server-url&gt;</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Reports are kept for 90 days. The CLI will confirm Pro is active.
          </p>
        </div>

        {/* Lost key note */}
        <p className="text-xs text-muted-foreground border-t pt-4">
          Didn&apos;t get the email? Check spam, or{' '}
          <a
            href="mailto:hello@vouqis.tech?subject=Resend%20my%20API%20key"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            email us
          </a>{' '}
          and we&apos;ll resend it.
        </p>

        <Link
          href="/evals"
          className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          ← Back to audit results
        </Link>

      </div>
    </main>
  )
}
