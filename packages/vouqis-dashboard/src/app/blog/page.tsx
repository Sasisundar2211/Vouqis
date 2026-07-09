import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Vouqis',
  description: 'Writing on AI change verification, eval-driven development, and safe AI deployment.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const POSTS = [
  {
    slug: 'the-eval-was-never-run',
    date: '2026-07-01',
    tag: 'Engineering',
    title: 'The eval was never run',
    excerpt:
      'The PR looked fine. The prompt change was small. The model still passed manual review. Then it shipped, and a week later someone noticed the output quality had quietly degraded. This is the failure mode Vouqis exists to prevent — and why "eval on every PR" is not optional once you ship AI.',
  },
  {
    slug: 'why-three-verdicts',
    date: '2026-06-18',
    tag: 'Product',
    title: 'Why BLOCK, WARN, SAFE — and not a score',
    excerpt:
      'A score of 0.74 tells you nothing about what to do. A verdict tells you exactly what to do. We spent three weeks debating whether to surface the raw eval number or collapse it to three outcomes. Here is why we chose three outcomes — and why the threshold is the most important config value in vouqis.yml.',
  },
  {
    slug: 'what-counts-as-an-ai-path',
    date: '2026-06-03',
    tag: 'Engineering',
    title: 'What counts as an AI path',
    excerpt:
      'The first question teams ask when they set up vouqis.yml is: which directories should go in ai_paths? Prompt files are obvious. Model config is obvious. But what about the Python code that constructs the prompt? The retrieval logic? The system message template? This is our current thinking.',
  },
  {
    slug: 'early-access-what-we-learned',
    date: '2026-05-22',
    tag: 'Product',
    title: 'Early access: what we learned from the first five teams',
    excerpt:
      'We ran Vouqis Verify with five teams before writing a single line of marketing copy. Every one of them had merged AI changes without running evals that week. Two had production regressions they traced back to prompt changes. This is what we learned, and what we built differently because of it.',
  },
]

export default function BlogPage() {
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
          Blog
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
          Writing on AI verification
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
          Engineering notes, incident walkthroughs, and product thinking from the Vouqis team.
        </p>
      </div>

      {/* Post list */}
      {POSTS.map((post, i) => (
        <article
          key={post.slug}
          style={{
            paddingBottom: 'clamp(36px,5vw,56px)',
            marginBottom: 'clamp(36px,5vw,56px)',
            borderBottom: i < POSTS.length - 1 ? '1px solid rgba(21,18,14,0.12)' : undefined,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.1em',
                color: '#9A9486',
              }}
            >
              {post.date}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '0.08em',
                color: '#5C564A',
                background: 'rgba(21,18,14,0.06)',
                padding: '3px 8px',
                borderRadius: 2,
              }}
            >
              {post.tag}
            </span>
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(24px,2.8vw,36px)',
              lineHeight: 1.1,
              color: '#15120E',
              margin: '0 0 14px',
              maxWidth: '36ch',
            }}
          >
            {post.title}
          </h2>

          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(14px,1vw,16.5px)',
              lineHeight: 1.7,
              color: '#5C564A',
              maxWidth: '60ch',
              margin: '0 0 20px',
            }}
          >
            {post.excerpt}
          </p>

          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: '#9A9486',
              letterSpacing: '0.04em',
            }}
          >
            Coming soon
          </span>
        </article>
      ))}
    </div>
  )
}
