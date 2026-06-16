'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/proxy',  label: 'Quickstart', external: false },
  { href: 'https://github.com/Sasisundar2211/Vouqis', label: 'GitHub', external: true },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-6">
      {LINKS.map(({ href, label, external }) =>
        external ? (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {label}
          </a>
        ) : (
          <Link
            key={href}
            href={href}
            className={`hidden sm:block text-sm transition-colors ${
              pathname === href
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        )
      )}
    </div>
  )
}
