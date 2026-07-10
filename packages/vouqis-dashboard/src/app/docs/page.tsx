import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docs — Vouqis',
  description: 'Vouqis Verify documentation: installation, quick start, verdicts, CLI reference, and configuration.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const NAV = [
  { label: 'Getting Started', id: 'getting-started' },
  { label: 'Verdicts',        id: 'verdicts' },
  { label: 'CLI Reference',   id: 'cli-reference' },
  { label: 'Configuration',   id: 'configuration' },
]

const VERDICTS = [
  {
    code: 'BLOCK_MERGE',
    label: 'Block Merge',
    color: '#FF6A4D',
    desc: 'The eval score fell below the configured threshold. The PR comment is posted as a failing check — the merge button is blocked until the score improves or the threshold is explicitly overridden.',
  },
  {
    code: 'MERGE_WITH_WARNING',
    label: 'Merge With Warning',
    color: '#C9A96E',
    desc: 'The eval passed but the score dropped from the baseline. The PR is not blocked, but the comment flags the regression with the delta so the team can decide whether to proceed.',
  },
  {
    code: 'SAFE_TO_MERGE',
    label: 'Safe to Merge',
    color: '#69B98D',
    desc: 'The eval score meets or exceeds the threshold and shows no regression from baseline. The PR comment shows the evidence and marks the check as passed.',
  },
]

const CLI_COMMANDS = [
  { cmd: 'vouqis init',   desc: 'Create a vouqis.yml config file in the current directory. Prompts for eval script path and threshold.' },
  { cmd: 'vouqis verify', desc: 'Detect changed AI paths, run evals, compute the verdict, and post the result to the open PR.' },
  { cmd: 'vouqis doctor', desc: 'Check that the config file, eval script, and GitHub token are all valid before running in CI.' },
]

export default function DocsPage() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,72px)',
        display: 'flex',
        gap: 'clamp(40px,6vw,80px)',
        alignItems: 'flex-start',
      }}
    >
      {/* Sidebar */}
      <nav
        aria-label="Documentation sections"
        style={{
          flex: '0 0 180px',
          position: 'sticky',
          top: 76,
        }}
        className="vq-docs-sidebar"
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#9A9486',
            marginBottom: 14,
          }}
        >
          Contents
        </div>
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="vq-nav-link"
            style={{
              display: 'block',
              fontFamily: MONO,
              fontSize: 12.5,
              color: '#5C564A',
              textDecoration: 'none',
              padding: '6px 0',
              borderLeft: '2px solid rgba(21,18,14,0.10)',
              paddingLeft: 12,
              transition: 'color 150ms ease',
              lineHeight: 1.4,
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: '1 1 0', minWidth: 0 }}>

        {/* Getting Started */}
        <section id="getting-started" style={{ marginBottom: 'clamp(56px,7vw,96px)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Getting Started
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4vw,52px)',
              lineHeight: 1.05,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            What is Vouqis Verify?
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '62ch',
              margin: '0 0 32px',
            }}
          >
            Vouqis Verify is a CLI that runs your evals on every pull request that touches AI
            code — prompts, evals, model config, agent logic — and posts a clear verdict to the
            PR before your team merges.
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '62ch',
              margin: '0 0 40px',
            }}
          >
            One GitHub Action step. No SDK changes. No infrastructure to run. Eval evidence on
            every merge.
          </p>

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '0 0 12px',
            }}
          >
            Installation
          </h2>
          <CodeBlock code={`# macOS / Linux (recommended)\npipx install vouqis-verify\n\n# Windows\npip install vouqis-verify`} />

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '32px 0 12px',
            }}
          >
            Quick Start
          </h2>
          <CodeBlock code={`vouqis init          # create vouqis.yml\nvouqis doctor        # verify config + GitHub token\nvouqis verify        # run evals and post to PR`} />

          <h2
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#15120E',
              margin: '32px 0 16px',
            }}
          >
            How it works
          </h2>
          <div
            style={{
              background: '#16130E',
              borderRadius: 6,
              padding: '22px 26px',
              fontFamily: MONO,
              fontSize: 13,
              lineHeight: 2.2,
              color: '#C9C2B2',
              display: 'inline-block',
            }}
          >
            <div style={{ color: '#8C8473' }}>PR opened or updated</div>
            <div style={{ color: '#4A4540' }}>  ↓</div>
            <div style={{ color: '#C9C2B2' }}>Vouqis detects changed AI paths</div>
            <div style={{ color: '#4A4540' }}>  ↓</div>
            <div style={{ color: '#C9C2B2' }}>Your eval script runs against the diff</div>
            <div style={{ color: '#4A4540' }}>  ↓</div>
            <div style={{ color: '#ED4B2A' }}>Verdict posted to PR <span style={{ color: '#4A4540', fontSize: 11 }}>(BLOCK / WARN / SAFE)</span></div>
          </div>
        </section>

        {/* Verdicts */}
        <section id="verdicts" style={{ marginBottom: 'clamp(56px,7vw,96px)', paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Verdicts
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            Three outcomes. No ambiguity.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '58ch',
              margin: '0 0 36px',
            }}
          >
            Every Vouqis run produces one of three verdicts. The verdict is posted as a GitHub
            check status so the merge button reflects the eval result automatically.
          </p>
          {VERDICTS.map((v) => (
            <div
              key={v.code}
              style={{
                padding: 'clamp(20px,2.4vw,28px) 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    color: v.color,
                    background: `color-mix(in srgb, ${v.color} 10%, #EFEAE0)`,
                    padding: '3px 8px',
                    borderRadius: 3,
                  }}
                >
                  {v.code}
                </code>
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: '#15120E' }}>
                  {v.label}
                </span>
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: '#5C564A',
                  maxWidth: '60ch',
                  margin: 0,
                }}
              >
                {v.desc}
              </p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)' }} />
        </section>

        {/* CLI Reference */}
        <section id="cli-reference" style={{ marginBottom: 'clamp(56px,7vw,96px)', paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            CLI Reference
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 28px',
            }}
          >
            vouqis commands
          </h2>
          <div style={{ marginTop: 4 }}>
            {CLI_COMMANDS.map((c, i) => (
              <div
                key={c.cmd}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '14px 0',
                  borderTop: i === 0 ? '1px solid rgba(21,18,14,0.12)' : undefined,
                  borderBottom: '1px solid rgba(21,18,14,0.12)',
                }}
              >
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    color: '#15120E',
                    flex: '0 0 auto',
                    minWidth: 180,
                  }}
                >
                  {c.cmd}
                </code>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: '#5C564A', flex: '1 1 200px' }}>
                  {c.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Configuration */}
        <section id="configuration" style={{ paddingTop: 'clamp(40px,5vw,64px)', borderTop: '1px solid rgba(21,18,14,0.12)' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ED4B2A',
              marginBottom: 16,
            }}
          >
            Configuration
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(28px,3.2vw,42px)',
              lineHeight: 1.08,
              color: '#15120E',
              margin: '0 0 20px',
            }}
          >
            vouqis.yml
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(15px,1.1vw,17.5px)',
              lineHeight: 1.7,
              color: '#46402F',
              maxWidth: '58ch',
              margin: '0 0 24px',
            }}
          >
            Place <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>vouqis.yml</code> at the
            repository root. Run <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>vouqis init</code> to
            generate it interactively.
          </p>
          <CodeBlock code={`ai_paths:\n  - prompts/\n  - evals/\n  - src/agents/\n\neval:\n  run: python evals/run.py\n  score_key: accuracy\n  threshold: 0.80\n\nreport:\n  post_to_pr: true\n  block_on_fail: true`} />
          <p
            style={{
              fontFamily: SANS,
              fontSize: 14.5,
              lineHeight: 1.65,
              color: '#5C564A',
              maxWidth: '58ch',
              marginTop: 16,
            }}
          >
            <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>ai_paths</code> lists the
            directories Vouqis watches. A PR that touches none of these paths skips the eval
            entirely. <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>score_key</code> is
            the key Vouqis reads from your eval output JSON.
          </p>
        </section>

      </main>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div
      style={{
        background: '#16130E',
        borderRadius: 5,
        padding: '14px 18px',
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: 1.7,
        color: '#C9C2B2',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}
    >
      {code}
    </div>
  )
}
