import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vouqis — MCP Trust Layer",
  description: "Score, monitor, and replay MCP server tool calls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-6xl mx-auto px-6 h-12 flex items-center gap-6">
            <span className="font-semibold text-sm tracking-tight">Vouqis</span>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Traces
            </Link>
            <Link
              href="/evals"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Eval Runs
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
