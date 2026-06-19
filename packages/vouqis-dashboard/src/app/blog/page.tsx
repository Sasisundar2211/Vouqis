import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Vouqis',
  description: 'Writing on MCP reliability, silent failures, and building trustworthy AI agent infrastructure.',
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-space-grotesk), system-ui, sans-serif'

const POSTS = [
  {
    slug: 'silent-mcp-failures',
    date: '2026-06-12',
    tag: 'Engineering',
    title: 'The four ways MCP servers fail silently',
    excerpt:
      'A 200 OK response is not a success signal. Here is what actually happens when an MCP tool returns null, an empty array, a malformed payload, or a result after a 30-second timeout — and why your agent cannot tell the difference without a gateway in the path.',
  },
  {
    slug: 'null-result-case-study',
    date: '2026-05-28',
    tag: 'Case study',
    title: 'How a null result cost a team three hours of debugging',
    excerpt:
      'A query_orders call returned HTTP 200 with result: null. The agent reported "no orders found." The customer had five pending orders. This is a walkthrough of exactly what happened, what Vouqis would have caught, and how to prevent the same class of incident.',
  },
  {
    slug: 'schema-drift-in-production',
    date: '2026-05-09',
    tag: 'Engineering',
    title: 'Schema drift is the invisible breaking change',
    excerpt:
      'When an MCP server changes a field type from string to number, or renames a required key, the HTTP response still returns 200. Your integration tests still pass. Your CI is green. The agent just starts answering questions about customer data with structurally wrong information.',
  },
  {
    slug: 'design-partner-program',
    date: '2026-04-22',
    tag: 'Product',
    title: 'Why we run a design-partner program instead of a beta waitlist',
    excerpt:
      'We work with five teams at a time, not five hundred. The difference is depth. Beta waitlists give you adoption numbers. Design-partner programs give you understanding. This is what we learned in the first cohort.',
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
          Writing on MCP reliability
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
