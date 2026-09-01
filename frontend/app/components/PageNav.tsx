'use client';

import { useRouter, usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
];

export default function PageNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '40px',
        paddingRight: '40px',
        backgroundColor: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
      }}
    >
      <div style={{ width: '140px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        {navLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className="nav-link"
            style={{
              color: pathname === link.href ? '#EFE58B' : undefined,
              borderBottom: pathname === link.href ? '1px solid rgba(239,229,139,0.6)' : 'none',
              paddingBottom: '2px',
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <button onClick={() => router.push('/app')} className="btn-nav">
        Get Started
      </button>
    </nav>
  );
}
