import type { Metadata } from 'next'
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vouqis.tech'),
  title: 'Vouqis — MCP Reliability Gateway',
  description:
    'Vouqis catches silent MCP failures — null results, schema drift, timeouts dressed as success — before they ever reach your AI agent.',
  keywords: [
    'MCP', 'Model Context Protocol', 'MCP reliability', 'MCP gateway',
    'MCP proxy', 'AI agents', 'agent reliability', 'silent failures',
    'MCP monitoring', 'AI infrastructure',
  ],
  openGraph: {
    title: 'Vouqis — MCP Reliability Gateway',
    description: 'Catch silent MCP failures before your AI agent acts on them.',
    type: 'website',
    url: 'https://vouqis.tech',
  },
  alternates: {
    canonical: 'https://vouqis.tech',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';window.scrollTo(0,0)" }} />
      </head>
      <body
        className={`${instrumentSerif.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">Skip to content</a>

        <header
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            borderBottom: '1px solid rgba(21,18,14,0.10)',
            background: 'color-mix(in srgb, #EFEAE0 84%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              maxWidth: 1500,
              margin: '0 auto',
              padding: '0 clamp(20px, 5vw, 72px)',
              height: 58,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            {/* Left: logo */}
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: '#ED4B2A',
                  boxShadow: '0 0 0 4px color-mix(in srgb, #ED4B2A 22%, transparent)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: '0.34em',
                  paddingLeft: '0.34em',
                  color: '#15120E',
                }}
              >
                VOUQIS
              </span>
            </a>

            {/* Center: nav links */}
            <nav
              className="vq-nav-center"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 32,
              }}
            >
              {[
                { label: 'docs',       href: '/docs' },
                { label: 'blog',       href: '/blog' },
                { label: 'changelog',  href: '/changelog' },
                { label: 'GitHub',     href: 'https://github.com/Sasisundar2211/Vouqis' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="vq-nav-link"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
                    fontSize: 12.5,
                    letterSpacing: '0.04em',
                    color: '#5C564A',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right: CTA */}
            <div className="vq-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a
                href="/design-partner"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
                  fontSize: 13,
                  color: '#FCEFE9',
                  background: '#15120E',
                  textDecoration: 'none',
                  borderRadius: 2,
                  padding: '10px 16px',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Join Design Partners →
              </a>
            </div>
          </div>
        </header>

        <main id="main-content">{children}</main>

        <Analytics />
      </body>
    </html>
  )
}
