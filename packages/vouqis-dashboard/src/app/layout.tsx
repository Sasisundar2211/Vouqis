import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://vouqis.tech'),
  title: 'Vouqis — Reliability Gateway for MCP Servers',
  description:
    'Reliability Gateway for MCP Servers. Detect null responses, schema mismatches, timeouts, and silent failures before they reach users.',
  keywords: [
    'MCP', 'Model Context Protocol', 'AI agents', 'reliability gateway',
    'agent infrastructure', 'MCP proxy', 'silent failures', 'agentops',
    'LLM observability', 'AI reliability',
  ],
  openGraph: {
    title: 'Vouqis — Reliability Gateway for MCP Servers',
    description:
      'Reliability Gateway for MCP Servers. Detect null responses, schema mismatches, timeouts, and silent failures before they reach users.',
    type: 'website',
    url: 'https://vouqis.tech',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
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
                href="/#how-it-works"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
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
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
