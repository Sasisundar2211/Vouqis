import { CopyButton } from '@/components/copy-button'
import { TerminalDemo } from '@/components/terminal-demo'

const VERDICTS = [
  {
    code: 'BLOCK MERGE',
    color: '#FF6A4D',
    bg: 'color-mix(in srgb, #FF6A4D 10%, #EFEAE0)',
    desc: 'Your eval failed. The score fell below the threshold. This change is not ready.',
  },
  {
    code: 'MERGE WITH WARNING',
    color: '#D4820A',
    bg: 'color-mix(in srgb, #D4820A 10%, #EFEAE0)',
    desc: 'Eval passed but AI files changed. Review carefully before you ship.',
  },
  {
    code: 'SAFE TO MERGE',
    color: '#69B98D',
    bg: 'color-mix(in srgb, #69B98D 10%, #EFEAE0)',
    desc: 'Eval passed. No AI file changes detected. Ship it.',
  },
]

const HOW_STEPS = [
  { k: '01', t: 'Add vouqis verify to your CI workflow' },
  { k: '02', t: 'On every PR, detect which AI files changed' },
  { k: '03', t: 'Run your eval command — any script, any framework' },
  { k: '04', t: 'Post a structured verdict to the PR as a comment' },
]

const WHAT_CHANGED_ROWS = [
  { path: 'prompts/',         files: 4, type: 'Prompt Files',  pct: '57%', bars: 8 },
  { path: 'evals/',           files: 2, type: 'Eval Scripts',  pct: '29%', bars: 4 },
  { path: 'config/',          files: 1, type: 'Model Config',  pct: '14%', bars: 2 },
]

const EARLY_ACCESS_BENEFITS = [
  'Direct access to the Vouqis team',
  'Shape the eval integration before v1 ships',
  'Weekly check-ins during onboarding',
  'Your PR patterns define the roadmap',
]

const PUBLIC_PROOF = [
  { label: 'GitHub Repository', value: 'Public · MIT', sub: 'open source', href: 'https://github.com/Sasisundar2211/Vouqis' },
  { label: 'PyPI Package', value: 'vouqis-verify', sub: 'pip installable today', href: 'https://pypi.org/project/vouqis-verify/' },
  { label: 'GitHub Action', value: 'v0.1.0', sub: 'vouqis/vouqis-verify', href: 'https://github.com/Sasisundar2211/Vouqis' },
  { label: 'GitHub App', value: 'Available', sub: 'install on any repo', href: 'https://github.com/Sasisundar2211/Vouqis' },
  { label: 'Test Suite', value: '33 passing', sub: 'automated CI tests', href: 'https://github.com/Sasisundar2211/Vouqis' },
  { label: 'Working MVP', value: 'Live', sub: 'vouqis.tech', href: 'https://vouqis.tech' },
]

const FAQ_ITEMS = [
  {
    q: "Why aren't evaluations enough?",
    a: "Evaluations give you a score. They don't tell you which files changed, whether the prompt shifted, or if the retriever config was updated. Vouqis generates that evidence — automatically, on every PR.",
  },
  {
    q: 'How is this different from observability tools?',
    a: 'Observability watches production. Vouqis runs before merge — in CI, on every PR — so you catch regressions before they ship.',
  },
  {
    q: 'Does Vouqis modify my code?',
    a: 'No. Vouqis reads your git diff, runs your existing eval command, and posts a comment to the PR. It never modifies files.',
  },
  {
    q: 'What AI changes does Vouqis detect?',
    a: 'Any files in the paths you configure: prompts, model configs, RAG pipelines, agent definitions, tool integrations, MCP server configs, and eval scripts.',
  },
  {
    q: 'Is this open source?',
    a: 'Yes. The CLI (vouqis-verify) is MIT-licensed and available on GitHub and PyPI.',
  },
  {
    q: 'How does the GitHub Action work?',
    a: 'Add one step to your workflow YAML referencing vouqis/vouqis-verify. It detects changed AI files, runs your eval_command, and posts the verdict comment. No SDK. No code changes.',
  },
]

const MANUAL_REVIEW_ITEMS = ['prompts', 'traces', 'retrieval', 'tool calls', 'logs', 'examples']

const FOOTER_COLS = [
  {
    h: 'Resources',
    items: [
      { label: 'Docs',       href: '/docs' },
      { label: 'GitHub',     href: 'https://github.com/Sasisundar2211/Vouqis' },
      { label: 'Changelog',  href: '/changelog' },
    ],
  },
  {
    h: 'Company',
    items: [
      { label: 'Early access', href: '/design-partner' },
      { label: 'Blog',         href: '/blog' },
      { label: 'Contact',      href: 'mailto:sasisundhar2211@gmail.com' },
    ],
  },
]

const MONO  = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS  = 'var(--font-space-grotesk), system-ui, sans-serif'

const SECTION_ANIM = {
  animation: 'vq-revealUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
  animationTimeline: 'view()',
  animationRange: 'entry 2% cover 18%',
} as React.CSSProperties

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(48px,8vw,104px) clamp(20px,5vw,72px) clamp(40px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(40px,5vw,76px)',
            alignItems: 'center',
          }}
        >
          {/* Left column */}
          <div style={{ flex: '1 1 460px', minWidth: 330 }}>
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 28,
                fontFamily: MONO,
                fontSize: 12.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#5C564A',
              }}
            >
              <span style={{ height: 1, width: 34, background: '#ED4B2A', flexShrink: 0 }} />
              AI Change Verification
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(46px,6.4vw,94px)',
                lineHeight: 0.96,
                letterSpacing: '-0.012em',
                maxWidth: '16ch',
                margin: '0 0 28px',
                color: '#15120E',
              }}
            >
              AI evaluations pass.{' '}
              <em
                style={{
                  fontStyle: 'italic',
                  color: '#ED4B2A',
                }}
              >
                Deployment risk remains.
              </em>
            </h1>

            {/* Body */}
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(17px,1.35vw,20px)',
                lineHeight: 1.55,
                color: '#3B362C',
                maxWidth: '50ch',
                margin: '0 0 32px',
              }}
            >
              Generate deployment evidence for AI pull requests before merge.
              Detect changes across prompts, models, RAG pipelines, agents,
              tool integrations, and MCP servers.
            </p>

            {/* CTA row */}
            <div
              className="vq-cta-row"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                marginBottom: 28,
              }}
            >
              <a
                href="/design-partner"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 52,
                  padding: '0 24px',
                  background: '#15120E',
                  color: '#E9E3D5',
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                }}
              >
                Join the Beta →
              </a>
              <a
                href="https://github.com/Sasisundar2211/Vouqis"
                target="_blank"
                rel="noopener noreferrer"
                className="vq-text-link"
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: '#15120E',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(21,18,14,0.3)',
                  paddingBottom: 3,
                  transition: 'opacity 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                View GitHub →
              </a>
            </div>

            {/* Footer badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px 22px',
                fontFamily: MONO,
                fontSize: 12,
                color: '#6B6557',
              }}
            >
              {['Free', 'Open source (MIT)', 'GitHub Action', 'Python CLI'].map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
          </div>

          {/* Right column — PR Comment Preview */}
          <div className="vq-hero-rhs" style={{ flex: '1 1 380px', minWidth: 320, display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: '#16130E',
                borderRadius: 6,
                padding: 8,
                boxShadow: '0 34px 70px -28px rgba(21,18,14,0.5), 0 2px 0 rgba(255,255,255,0.04) inset',
                width: '100%',
                maxWidth: 480,
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px 10px',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8473' }}>
                  vouqis verify · PR #47
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', color: '#69B98D' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#69B98D', animation: 'vq-pulse 2s ease-in-out infinite', display: 'inline-block' }} />
                  POSTED
                </span>
              </div>

              {/* Code area */}
              <div
                style={{
                  background: '#0E0C08',
                  borderRadius: 3,
                  padding: '18px 20px',
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.9,
                  color: '#C9C2B2',
                }}
              >
                <div style={{ color: '#8C8473', marginBottom: 8, fontSize: 11 }}>## What Changed</div>
                {[
                  { path: 'prompts/', n: '4 files', bars: '████████' },
                  { path: 'evals/',   n: '2 files', bars: '████' },
                  { path: 'config/',  n: '1 file ', bars: '██' },
                ].map((r) => (
                  <div key={r.path}>
                    <span style={{ color: '#E9E3D5' }}>{r.path}</span>
                    {'  '}
                    <span style={{ color: '#4A4540' }}>{r.n}</span>
                    {'  '}
                    <span style={{ color: '#ED4B2A' }}>{r.bars}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '10px 0' }} />

                <div>
                  <span style={{ color: '#8C8473' }}>eval score</span>
                  {'  '}
                  <span style={{ color: '#FF6A4D' }}>0.71</span>
                  <span style={{ color: '#4A4540' }}> / 1.00</span>
                </div>
                <div>
                  <span style={{ color: '#8C8473' }}>threshold</span>
                  {'  '}
                  <span style={{ color: '#C9C2B2' }}>0.80</span>
                </div>
              </div>

              {/* Verdict stamp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  margin: '8px 0 0',
                  padding: '13px 15px',
                  background: 'color-mix(in srgb, #ED4B2A 16%, #16130E)',
                  border: '1px solid color-mix(in srgb, #ED4B2A 50%, transparent)',
                  borderRadius: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#FF6A4D',
                    border: '1.5px solid #FF6A4D',
                    padding: '5px 9px',
                    borderRadius: 2,
                    transform: 'rotate(-3deg)',
                    display: 'inline-block',
                    animation: 'vq-stamp 0.7s cubic-bezier(.2,.8,.2,1) 0.5s both',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  BLOCK MERGE
                </span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: '#FF6A4D', fontWeight: 500 }}>
                    eval score below threshold
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#9A8E84', marginTop: 3 }}>
                    0.71 &lt; 0.80 · blocked
                  </div>
                </div>
              </div>

              {/* Comment line */}
              <div style={{ padding: '10px 10px 4px', fontFamily: MONO, fontSize: 11, fontStyle: 'italic', color: '#6E6657' }}>
                {`// without vouqis: this PR would have merged without evidence`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section
        id="problem"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 'clamp(48px,5vw,80px)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(38px,5vw,68px)',
                lineHeight: 1.0,
                color: '#15120E',
                margin: '0 0 4px',
              }}
            >
              Passing evaluations
            </h2>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(38px,5vw,68px)',
                lineHeight: 1.0,
                color: '#ED4B2A',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              don&apos;t tell you what changed.
            </h2>
          </div>
          <div style={{ maxWidth: '42ch' }}>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(16px,1.2vw,18.5px)',
                lineHeight: 1.65,
                color: '#5C564A',
                margin: '0 0 16px',
              }}
            >
              Engineering teams still review all of this before approving AI pull requests:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 16 }}>
              {MANUAL_REVIEW_ITEMS.map((item) => (
                <span
                  key={item}
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: '#5C564A',
                    background: 'rgba(21,18,14,0.06)',
                    border: '1px solid rgba(21,18,14,0.12)',
                    padding: '4px 10px',
                    borderRadius: 3,
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(16px,1.2vw,18.5px)',
                lineHeight: 1.65,
                color: '#15120E',
                margin: 0,
                fontWeight: 500,
              }}
            >
              Vouqis Verify generates that deployment evidence automatically.
            </p>
          </div>
        </div>

        {/* Evidence blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 1,
            background: 'rgba(21,18,14,0.10)',
            border: '1px solid rgba(21,18,14,0.10)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'PR status',      value: 'Merged',          color: '#69B98D' },
            { label: 'Eval run?',      value: 'No',              color: '#FF6A4D' },
            { label: 'Score before',   value: 'Unknown',         color: '#C9C2B2' },
          ].map((item) => (
            <div
              key={item.label}
              style={{ background: '#EFEAE0', padding: 'clamp(20px,2.5vw,30px) clamp(20px,2.5vw,28px)' }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9A9486',
                  marginBottom: 10,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(18px,2vw,26px)', color: item.color, lineHeight: 1.2 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(18px,1.8vw,24px)',
            lineHeight: 1.4,
            color: '#5C564A',
            margin: 'clamp(28px,3vw,40px) 0 0',
            maxWidth: '52ch',
          }}
        >
          The code review said LGTM. The diff looked small. Nobody ran the eval.
          Vouqis makes it automatic.
        </p>
      </section>

      {/* ── WHY AI PRS ARE DIFFERENT ────────────────────────────────────────── */}
      <section
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(34px,4.4vw,60px)',
            margin: '0 0 clamp(40px,5vw,64px)',
            color: '#15120E',
            lineHeight: 1.05,
            maxWidth: '28ch',
          }}
        >
          Why AI pull requests are different
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: 'rgba(21,18,14,0.10)', border: '1px solid rgba(21,18,14,0.10)', borderRadius: 6, overflow: 'hidden' }}>
          {[
            {
              label: 'Traditional software',
              steps: ['Tests pass', 'Merge'],
              accent: '#69B98D',
            },
            {
              label: 'AI software today',
              steps: ['Tests pass', 'Behavior changes', 'Manual review', 'Merge'],
              accent: '#FF6A4D',
              highlight: true,
            },
            {
              label: 'With Vouqis',
              steps: ['Tests + Deployment Evidence', 'Review Package', 'Merge'],
              accent: '#69B98D',
            },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                background: col.highlight ? 'color-mix(in srgb, #FF6A4D 5%, #EFEAE0)' : '#EFEAE0',
                padding: 'clamp(24px,2.5vw,36px)',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 20 }}>
                {col.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.steps.map((step, i) => (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        color: col.highlight && step === 'Manual review' ? '#FF6A4D' : '#15120E',
                        background: '#FFFFFF',
                        border: col.highlight && step === 'Manual review' ? '1px solid rgba(255,106,77,0.4)' : '1px solid rgba(21,18,14,0.12)',
                        borderRadius: 4,
                        padding: '10px 14px',
                      }}
                    >
                      {step}
                    </div>
                    {i < col.steps.length - 1 && (
                      <div style={{ fontFamily: MONO, fontSize: 12, color: '#9A9486', paddingLeft: 14 }}>↓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(18px,1.8vw,24px)',
            lineHeight: 1.4,
            color: '#5C564A',
            margin: 'clamp(28px,3vw,40px) 0 0',
            maxWidth: '52ch',
          }}
        >
          The middle column is where AI teams spend their review time today.
          Vouqis collapses it into one automated step.
        </p>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section
        id="how"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,64px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
              maxWidth: '24ch',
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '54ch',
              margin: 0,
            }}
          >
            Vouqis sits in your CI pipeline. On every PR it detects which AI
            files changed, runs your eval, and posts a verdict comment. Four steps.
            No SDK. No per-file wrappers.
          </p>
        </div>

        {/* FIG.01 — Pipeline flow */}
        <figure
          style={{
            border: '1px solid rgba(21,18,14,0.16)',
            borderRadius: 8,
            background: '#F7F4EC',
            padding: 'clamp(24px,3vw,44px) clamp(20px,3vw,40px)',
            overflowX: 'auto',
            margin: `0 0 clamp(40px,4vw,56px)`,
          }}
        >
          <div style={{ minWidth: 640 }}>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: 6,
                marginBottom: 30,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#7A7464',
              }}
            >
              <span>Pull Request</span>
              <span style={{ color: '#ED4B2A' }}>Vouqis Verify</span>
              <span>Your Eval</span>
              <span style={{ textAlign: 'right' }}>PR Comment</span>
            </div>

            {/* Flow rail */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[
                { label: 'PR OPENED',    sub: 'on every push',      variant: 'light' },
                { label: 'DETECT',       sub: 'changed AI files',   variant: 'dark'  },
                { label: 'RUN EVAL',     sub: 'your eval command',  variant: 'light' },
                { label: 'POST VERDICT', sub: 'BLOCK / WARN / SAFE', variant: 'light' },
              ].map((node, i, arr) => (
                <>
                  <div
                    key={node.label}
                    style={{
                      flex: '0 0 auto',
                      width: 140,
                      background: node.variant === 'dark' ? '#16130E' : '#FFFFFF',
                      border: node.variant === 'dark' ? '1.5px solid #ED4B2A' : '1px solid rgba(21,18,14,0.16)',
                      borderRadius: 5,
                      padding: '13px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: node.variant === 'dark' ? '#8C8473' : '#7A7464', marginBottom: 4 }}>
                      {node.label}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: node.variant === 'dark' ? '#E9E3D5' : '#15120E', fontWeight: 500 }}>
                      {node.sub}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ flex: '1 1 40px', minWidth: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: '#15120E', background: 'rgba(21,18,14,0.05)', border: '1px solid rgba(21,18,14,0.12)', borderRadius: 3, padding: '3px 7px', whiteSpace: 'nowrap' }}>
                        →
                      </div>
                      <div style={{ width: '100%', height: 1, background: 'rgba(21,18,14,0.26)' }} />
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>

          <figcaption style={{ fontFamily: MONO, fontSize: 11.5, color: '#7A7464', marginTop: 26, paddingTop: 16, borderTop: '1px solid rgba(21,18,14,0.12)' }}>
            One CI step. Vouqis detects the changed files, runs your eval, and posts the{' '}
            <span style={{ color: '#ED4B2A' }}>verdict</span> to the PR automatically.
          </figcaption>
        </figure>

        {/* Config + Steps */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,56px)' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 14 }}>
              vouqis.yml
            </div>
            <div
              style={{
                background: '#16130E',
                borderRadius: 6,
                padding: '22px 24px',
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.8,
                color: '#C9C2B2',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#8C8473', marginBottom: 12 }}>
                # minimal config to get started
              </div>
              <div>
                <span style={{ color: '#9AB4C9' }}>eval_command</span>
                <span>{': '}</span>
                <span style={{ color: '#69B98D' }}>&quot;python evals/run.py&quot;</span>
              </div>
              <div>
                <span style={{ color: '#9AB4C9' }}>threshold</span>
                <span>{':     '}</span>
                <span style={{ color: '#C9C2B2' }}>0.80</span>
              </div>
              <div>
                <span style={{ color: '#9AB4C9' }}>baseline</span>
                <span>{':     '}</span>
                <span style={{ color: '#C9C2B2' }}>origin/main</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', margin: '10px 0' }} />
              <div>
                <span style={{ color: '#9AB4C9' }}>ai_paths</span>
                <span>:</span>
              </div>
              <div>
                {'  '}<span style={{ color: '#C9C2B2' }}>- prompts/</span>
              </div>
              <div>
                {'  '}<span style={{ color: '#C9C2B2' }}>- evals/</span>
              </div>
              <div>
                {'  '}<span style={{ color: '#C9C2B2' }}>- config/model.yml</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', paddingTop: 12, marginTop: 14, color: '#69B98D', fontSize: 12, whiteSpace: 'normal' }}>
                ready — 3 paths monitored
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 14 }}>
              What happens on every PR
            </div>
            {HOW_STEPS.map((c) => (
              <div
                key={c.k}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '13px 0',
                  borderTop: '1px solid rgba(21,18,14,0.12)',
                  fontFamily: MONO,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  color: '#38332A',
                }}
              >
                <span style={{ color: '#ED4B2A', flex: '0 0 auto' }}>{c.k}</span>
                <span>{c.t}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)' }} />

            <p
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(20px,2vw,26px)',
                lineHeight: 1.3,
                color: '#15120E',
                marginTop: 22,
                maxWidth: '26ch',
              }}
            >
              Every PR becomes a data point. Every merge becomes a decision with evidence.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE VERDICT ─────────────────────────────────────────────────────── */}
      <section
        id="verdicts"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
            }}
          >
            Three verdicts. No ambiguity.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            Every Vouqis report ends with one of three verdicts. The logic is
            deterministic — same eval result, same changed files, same verdict.
          </p>
        </div>

        <div>
          {VERDICTS.map((v, i) => (
            <div
              key={v.code}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(20px,3vw,48px)',
                padding: 'clamp(24px,3vw,36px) 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
                borderBottom: i === VERDICTS.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
                alignItems: 'flex-start',
              }}
            >
              <code
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: v.color,
                  background: v.bg,
                  padding: '4px 10px',
                  borderRadius: 3,
                  flex: '0 0 auto',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                {v.code}
              </code>
              <div style={{ flex: '1 1 260px' }}>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 'clamp(16px,1.2vw,19px)',
                    lineHeight: 1.65,
                    color: '#5C564A',
                    margin: 0,
                    maxWidth: '54ch',
                  }}
                >
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'clamp(32px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 16 }}>
            Every verdict includes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
            {['Verdict + Confidence', 'What Changed (per path)', 'Eval score + threshold', 'Why (cited reasons)', 'Feedback link'].map((o) => (
              <span
                key={o}
                style={{
                  fontFamily: MONO,
                  fontSize: 12.5,
                  color: '#38332A',
                  background: 'rgba(21,18,14,0.05)',
                  border: '1px solid rgba(21,18,14,0.12)',
                  padding: '6px 14px',
                  borderRadius: 3,
                }}
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT CHANGED ────────────────────────────────────────────────────── */}
      <section
        id="report"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
              maxWidth: '26ch',
            }}
          >
            Every PR report shows exactly what moved.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            Before the verdict, Vouqis shows a per-path breakdown of which AI
            files changed and how many — so reviewers know exactly what to look at.
          </p>
        </div>

        {/* Report mockup */}
        <div
          style={{
            background: '#16130E',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 'clamp(20px,3vw,32px)',
            boxShadow: '0 30px 70px -36px rgba(21,18,14,0.45)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              padding: '13px clamp(16px,2vw,22px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8C8473' }}>
              Vouqis Verify Report · PR #47
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', color: '#FF6A4D' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6A4D', display: 'inline-block' }} />
              BLOCK MERGE
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 520, padding: 'clamp(16px,2vw,24px) clamp(16px,2vw,22px)' }}>

              {/* What Changed section */}
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4540', marginBottom: 14 }}>
                ## What Changed
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 60px 1fr 80px',
                  gap: 12,
                  padding: '9px clamp(12px,1.5vw,16px)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4A4540',
                }}
              >
                <span>Path</span>
                <span>Files</span>
                <span>Type</span>
                <span style={{ textAlign: 'right' }}>Share</span>
              </div>

              {WHAT_CHANGED_ROWS.map((r) => (
                <div
                  key={r.path}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 60px 1fr 80px',
                    gap: 12,
                    alignItems: 'center',
                    padding: `13px clamp(12px,1.5vw,16px)`,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 13, color: '#C9C2B2' }}>{r.path}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: '#E9E3D5', fontWeight: 500 }}>{r.files}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#8C8473' }}>{r.type}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#9A9486', textAlign: 'right' }}>{r.pct}</span>
                </div>
              ))}

              {/* Divider + eval metrics */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  margin: '16px 0',
                  padding: `16px clamp(12px,1.5vw,16px) 0`,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px 32px',
                }}
              >
                {[
                  { label: 'Eval score', value: '0.71 / 1.00', alert: true  },
                  { label: 'Threshold',  value: '0.80',         alert: false },
                  { label: 'Latency',    value: '1,240 ms',     alert: false },
                ].map((m) => (
                  <div key={m.label} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4540' }}>{m.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: m.alert ? '#FF6A4D' : '#C9C2B2', fontWeight: m.alert ? 600 : 400 }}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Verdict bar */}
              <div
                style={{
                  margin: `0 clamp(0px,0.5vw,0px)`,
                  padding: 'clamp(12px,1.5vw,16px)',
                  background: 'color-mix(in srgb, #ED4B2A 12%, #16130E)',
                  border: '1px solid color-mix(in srgb, #ED4B2A 40%, transparent)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: '#FF6A4D',
                    border: '1.5px solid #FF6A4D',
                    padding: '5px 10px',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                >
                  BLOCK MERGE
                </span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: '#FF6A4D' }}>eval score 0.71 is below threshold 0.80</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#9A8E84', marginTop: 3 }}>4 prompt files changed — model behavior may have shifted</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,56px)' }}>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 14 }}>
              AI file paths monitored
            </div>
            {WHAT_CHANGED_ROWS.map((r) => (
              <div
                key={r.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  borderTop: '1px solid rgba(21,18,14,0.10)',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#38332A', flex: '1 1 auto' }}>{r.path}</span>
                <span style={{ fontFamily: SERIF, fontSize: 26, color: '#15120E' }}>{r.files}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9A9486', width: 36, textAlign: 'right', flexShrink: 0 }}>{r.pct}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.10)' }} />
          </div>

          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center' }}>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(22px,2.4vw,32px)',
                lineHeight: 1.22,
                color: '#15120E',
                margin: 0,
                maxWidth: '26ch',
              }}
            >
              7 AI files changed.{' '}
              <em style={{ fontStyle: 'italic', color: '#ED4B2A' }}>One</em>{' '}
              command to know if they&apos;re safe to ship.
            </p>
          </div>
        </div>
      </section>

      {/* ── PUBLIC PROOF ────────────────────────────────────────────────────── */}
      <section
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1500,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,60px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
            }}
          >
            Verifiable from day one.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            Every claim below is publicly checkable. No waitlist. No deck. No demo request.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: 'rgba(21,18,14,0.10)', border: '1px solid rgba(21,18,14,0.10)', borderRadius: 6, overflow: 'hidden' }}>
          {PUBLIC_PROOF.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#EFEAE0', padding: 'clamp(20px,2.5vw,30px)', textDecoration: 'none', display: 'block' }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 10 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(16px,1.8vw,22px)', color: '#15120E', lineHeight: 1.2, marginBottom: 6 }}>
                {item.value}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: '#7A7464' }}>
                {item.sub} ↗
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── DEMO ────────────────────────────────────────────────────────────── */}
      <section
        id="demo"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1320,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div style={{ marginBottom: 'clamp(40px,5vw,56px)' }}>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(34px,4.4vw,60px)',
              margin: '0 0 20px',
              color: '#15120E',
              lineHeight: 1.05,
            }}
          >
            Watch it verify one.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(16px,1.2vw,18.5px)',
              lineHeight: 1.6,
              color: '#5C564A',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            One command. Detects changed files, runs your eval, delivers a verdict.
            Works in CI or locally before you push.
          </p>
        </div>

        <TerminalDemo />

        <div style={{ marginTop: 32 }}>
          <CopyButton size="sm" />
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1100,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(34px,4.4vw,60px)',
            margin: '0 0 clamp(40px,5vw,60px)',
            color: '#15120E',
            lineHeight: 1.05,
          }}
        >
          Common questions
        </h2>

        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(20px,4vw,56px)',
                padding: 'clamp(24px,3vw,36px) 0',
                borderTop: '1px solid rgba(21,18,14,0.12)',
                borderBottom: i === FAQ_ITEMS.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
              }}
            >
              <p style={{ fontFamily: SERIF, fontSize: 'clamp(17px,1.4vw,21px)', lineHeight: 1.3, color: '#15120E', margin: 0 }}>
                {item.q}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,1.1vw,17px)', lineHeight: 1.65, color: '#5C564A', margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EARLY ACCESS ────────────────────────────────────────────────────── */}
      <section
        id="early-access"
        style={{
          ...SECTION_ANIM,
          padding: 'clamp(72px,9vw,128px) clamp(20px,5vw,72px)',
          maxWidth: 1100,
          margin: '0 auto',
          borderTop: '1px solid rgba(21,18,14,0.12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(40px,6vw,88px)',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: '1 1 340px' }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#ED4B2A',
                marginBottom: 20,
              }}
            >
              Early access
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(34px,4.4vw,58px)',
                lineHeight: 1.02,
                color: '#15120E',
                margin: '0 0 20px',
                maxWidth: '18ch',
              }}
            >
              We&apos;re working with teams shipping AI changes.
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(15px,1.1vw,18px)',
                lineHeight: 1.65,
                color: '#5C564A',
                maxWidth: '44ch',
                margin: 0,
              }}
            >
              We&apos;re working with a small number of teams merging AI-generated
              changes without eval coverage. If your team makes prompt or model
              decisions without evidence today, this is for you.
            </p>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9486', marginBottom: 16 }}>
              What you get
            </div>
            {EARLY_ACCESS_BENEFITS.map((b, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '13px 0',
                  borderTop: '1px solid rgba(21,18,14,0.12)',
                  fontFamily: SANS,
                  fontSize: 15.5,
                  color: '#38332A',
                  lineHeight: 1.55,
                }}
              >
                <span style={{ color: '#69B98D', fontFamily: MONO, fontSize: 13, flexShrink: 0, marginTop: 2 }}>→</span>
                <span>{b}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(21,18,14,0.12)', marginBottom: 28 }} />

            <a
              href="/design-partner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 52,
                padding: '0 26px',
                background: '#ED4B2A',
                color: '#FCEFE9',
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                borderRadius: 3,
              }}
            >
              Join the Beta →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#16130E',
          color: '#9A9387',
          padding: 'clamp(56px,6vw,88px) clamp(20px,5vw,72px) 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1500,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 48,
            justifyContent: 'space-between',
          }}
        >
          {/* Left */}
          <div style={{ flex: '1 1 280px', maxWidth: '34ch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ED4B2A', flexShrink: 0 }} />
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, letterSpacing: '0.34em', color: '#E9E3D5' }}>
                VOUQIS
              </span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.35, color: '#C9C2B2', margin: 0 }}>
              Eval evidence on every AI pull request.
            </p>
          </div>

          {/* Footer columns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px 64px' }}>
            {FOOTER_COLS.map((col) => (
              <div key={col.h} style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 2.2 }}>
                <div style={{ color: '#5C564A', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {col.h}
                </div>
                {col.items.map((item) => (
                  <div key={item.label}>
                    <a
                      href={item.href}
                      className="vq-text-link"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ color: '#9A9387', textDecoration: 'none', transition: 'color 150ms ease' }}
                    >
                      {item.label}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            maxWidth: 1500,
            margin: '48px auto 0',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontFamily: MONO,
            fontSize: 11.5,
            color: '#5C564A',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            justifyContent: 'space-between',
          }}
        >
          <span>© 2026 Vouqis · MIT</span>
          <span>built for teams tired of merging AI changes blind</span>
        </div>
      </footer>
    </>
  )
}
