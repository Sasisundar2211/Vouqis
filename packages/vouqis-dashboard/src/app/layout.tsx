import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Vouqis — AI Agent Reliability Gateway',
  description:
    'Reliability gateway between AI agents and MCP servers. Validates requests, responses, timeouts, and execution outcomes before failures become customer-visible incidents.',
  openGraph: {
    title: 'Vouqis — AI Agent Reliability Gateway',
    description:
      'Reliability gateway between AI agents and MCP servers. Validates requests, responses, timeouts, and execution outcomes before failures become customer-visible incidents.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-tight">Vouqis</span>
            <a
              href="https://github.com/Sasisundar2211/vouqis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </header>
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
