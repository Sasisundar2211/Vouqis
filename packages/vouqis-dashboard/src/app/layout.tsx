import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ScrollReset } from '@/components/scroll-reset'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://vouqis.tech'),
  title: 'Vouqis — Catch MCP Failures Before Your Users Do',
  description:
    'Route MCP traffic through Vouqis and detect null responses, schema violations, timeouts, and silent failures before they reach users.',
  keywords: [
    'MCP', 'Model Context Protocol', 'AI agents', 'reliability gateway',
    'agent infrastructure', 'MCP proxy', 'silent failures', 'agentops',
    'LLM observability', 'AI reliability',
  ],
  openGraph: {
    title: 'Vouqis — Catch MCP Failures Before Your Users Do',
    description:
      'Route MCP traffic through Vouqis and detect null responses, schema violations, timeouts, and silent failures before they reach users.',
    type: 'website',
    url: 'https://vouqis.tech',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-foreground focus:text-background focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity">
              Vouqis
            </a>
            <div className="flex items-center gap-6">
              <a
                href="/proxy"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Quickstart
              </a>
              <a
                href="https://github.com/Sasisundar2211/Vouqis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>
        <ScrollReset />
        <main id="main-content" className="pt-14">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
