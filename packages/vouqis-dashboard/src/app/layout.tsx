import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://vouqis.tech'),
  title: 'Vouqis — Catch MCP Failures Before Your Users Do',
  description:
    'Catch silent MCP failures before your users discover them. Vouqis sits between your AI agent and MCP server, validating every tool call and blocking failures that appear successful but never complete.',
  keywords: [
    'MCP', 'Model Context Protocol', 'MCP reliability', 'MCP gateway',
    'MCP proxy', 'AI agents', 'agent reliability', 'silent failures',
    'MCP monitoring', 'AI infrastructure',
  ],
  openGraph: {
    title: 'Your Agent Said Success. The Action Never Happened.',
    description:
      'Catch silent MCP failures before your users do.',
    type: 'website',
    url: 'https://vouqis.tech',
    images: ['/opengraph-image.png'],
  },
  alternates: {
    canonical: 'https://vouqis.tech',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Must run before browser scroll restoration */}
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';window.scrollTo(0,0)" }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground font-sans`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-foreground focus:text-background focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-sans font-medium text-foreground hover:opacity-80 transition-opacity"
              style={{ letterSpacing: '0.34em', fontSize: '0.8125rem' }}
            >
              VOUQIS
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/proxy"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Audit
              </Link>
              <a
                href="https://github.com/Sasisundar2211/Vouqis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="#design-partner"
                className="hidden sm:inline-flex h-8 px-3 items-center rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 transition-colors"
              >
                Join Design Partner Program
              </a>
            </div>
          </div>
        </header>
        <main id="main-content" className="pt-14">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
