import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog — Vouqis',
  description: 'Version history for Vouqis Verify, the AI change verification CLI.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

type ChangeType = 'feat' | 'fix' | 'refactor' | 'chore'

type Change = {
  type: ChangeType
  text: string
}

type Release = {
  version: string
  date: string
  summary: string
  changes: Change[]
}

const RELEASES: Release[] = [
  {
    version: 'v0.1.3',
    date: '2026-07-01',
    summary: 'doctor command added; baseline comparison now includes previous run score.',
    changes: [
      { type: 'feat',    text: 'vouqis doctor checks config validity, eval script path, and GitHub token before CI runs.' },
      { type: 'feat',    text: 'Baseline score from the last passing run is included in the PR comment delta row.' },
      { type: 'fix',     text: 'vouqis verify now exits non-zero on BLOCK_MERGE verdict so GitHub Actions marks the step as failed.' },
      { type: 'chore',   text: 'Restore scroll position to top on every page load via inline head script.' },
    ],
  },
  {
    version: 'v0.1.2',
    date: '2026-06-18',
    summary: 'PR comment posting via GitHub API; MERGE_WITH_WARNING verdict introduced.',
    changes: [
      { type: 'feat',    text: 'Post formatted verdict comment to pull request via GitHub REST API on every verify run.' },
      { type: 'feat',    text: 'MERGE_WITH_WARNING verdict fires when score passes threshold but regresses from baseline.' },
      { type: 'feat',    text: 'report.block_on_fail config key controls whether a failing check blocks the merge button.' },
      { type: 'fix',     text: 'Score key lookup now raises a clear error when score_key is missing from eval output JSON.' },
    ],
  },
  {
    version: 'v0.1.1',
    date: '2026-06-05',
    summary: 'Config validation hardening; ai_paths glob support.',
    changes: [
      { type: 'feat',    text: 'ai_paths entries now support glob patterns (e.g. src/agents/**/*.py).' },
      { type: 'fix',     text: 'vouqis init validates that the eval script path exists before writing vouqis.yml.' },
      { type: 'refactor', text: 'Config loading extracted into its own module with typed schema validation.' },
      { type: 'chore',   text: 'pytest added to CI; config loader and verdict logic covered.' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-05-22',
    summary: 'First public release. AI path detection, eval runner, three-verdict engine.',
    changes: [
      { type: 'feat', text: 'vouqis verify detects changed files against ai_paths and skips runs on non-AI PRs.' },
      { type: 'feat', text: 'Eval runner executes any shell command and reads score from JSON stdout.' },
      { type: 'feat', text: 'BLOCK_MERGE and SAFE_TO_MERGE verdicts based on configurable threshold.' },
      { type: 'feat', text: 'vouqis.yml config with ai_paths, eval.run, eval.score_key, eval.threshold.' },
      { type: 'feat', text: 'vouqis init interactive setup generates vouqis.yml from prompts.' },
    ],
  },
]

const TYPE_COLORS: Record<ChangeType, string> = {
  feat:     '#69B98D',
  fix:      '#FF6A4D',
  refactor: '#C9A96E',
  chore:    '#8C8473',
}

export default function ChangelogPage() {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: 'clamp(56px,8vw,104px) clamp(20px,5vw,72px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(56px,7vw,88px)' }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ED4B2A',
            marginBottom: 18,
          }}
        >
          Changelog
        </div>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(38px,5vw,66px)',
            lineHeight: 1.02,
            color: '#15120E',
            margin: '0 0 18px',
          }}
        >
          Version history
        </h1>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(15px,1.1vw,17.5px)',
            lineHeight: 1.65,
            color: '#5C564A',
            maxWidth: '52ch',
            margin: 0,
          }}
        >
          Every release of <code style={{ fontFamily: MONO, fontSize: '0.9em' }}>vouqis-verify</code>.
          Unreleased changes are on{' '}
          <a
            href="https://github.com/Sasisundar2211/Vouqis"
            target="_blank"
            rel="noopener noreferrer"
            className="vq-text-link"
            style={{ color: '#15120E', borderBottom: '1px solid rgba(21,18,14,0.3)', textDecoration: 'none' }}
          >
            GitHub
          </a>.
        </p>
      </div>

      {/* Releases */}
      {RELEASES.map((release, i) => (
        <div
          key={release.version}
          style={{
            paddingBottom: 'clamp(40px,5vw,64px)',
            marginBottom: 'clamp(40px,5vw,64px)',
            borderBottom: i < RELEASES.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(18px,2vw,24px)',
                color: '#15120E',
                fontWeight: 600,
              }}
            >
              {release.version}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: '#9A9486',
                letterSpacing: '0.04em',
              }}
            >
              {release.date}
            </span>
          </div>

          <p
            style={{
              fontFamily: SANS,
              fontSize: 15.5,
              lineHeight: 1.6,
              color: '#46402F',
              maxWidth: '56ch',
              margin: '0 0 22px',
            }}
          >
            {release.summary}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {release.changes.map((change, j) => (
              <div
                key={j}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'baseline',
                  padding: '8px 0',
                  borderTop: j === 0 ? '1px solid rgba(21,18,14,0.10)' : undefined,
                  borderBottom: '1px solid rgba(21,18,14,0.10)',
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    color: TYPE_COLORS[change.type],
                    flex: '0 0 54px',
                  }}
                >
                  {change.type}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: '#38332A',
                  }}
                >
                  {change.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
