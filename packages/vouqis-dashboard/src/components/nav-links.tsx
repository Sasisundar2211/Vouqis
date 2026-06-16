'use client'

import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/proxy',                    label: 'Quickstart' },
  { href: '/#how-it-works',            label: 'How It Works' },
  { href: 'https://github.com/Sasisundar2211/Vouqis', label: 'GitHub', external: true },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-6">
      {LINKS.map(({ href, label, external }) => {
        const isActive = !external && pathname === href
        return (
          <a
            key={href}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`text-sm transition-colors ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } ${href === '/proxy' ? 'hidden sm:block' : href.startsWith('/#') ? 'hidden sm:block' : ''}`}
          >
            {label}
          </a>
        )
      })}
    </div>
  )
}
