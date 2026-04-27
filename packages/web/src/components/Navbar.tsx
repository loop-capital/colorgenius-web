'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: '/formulate', label: 'Formulate' },
  { href: '/questionnaire', label: 'New Client' },
  { href: '/history', label: 'History' },
  { href: '/library', label: 'Colors' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .cg-desktop-nav { display: none !important; }
          .cg-desktop-right { display: none !important; }
          .cg-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .cg-mobile-menu { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .cg-desktop-nav { gap: 0 !important; }
          .cg-desktop-nav li a { padding: 0.375rem 0.5rem !important; font-size: 0.8125rem !important; }
        }
      `}</style>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="#6366F1" />
              <circle cx="16" cy="16" r="8" fill="#F59E0B" />
              <circle cx="16" cy="16" r="4" fill="#ffffff" />
            </svg>
            <span style={styles.logoText}>ColorGenius</span>
          </Link>

          <ul className="cg-desktop-nav" style={styles.desktopNav}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    ...styles.navLink,
                    ...(pathname === link.href ? styles.navLinkActive : {}),
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="cg-desktop-right" style={styles.desktopRight}>
            {isAuthenticated ? (
              <span style={styles.userName}>{user?.name || user?.email}</span>
            ) : (
              <>
                <Link href="/login" style={styles.navLink}>Sign In</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          <button
            className="cg-mobile-toggle"
            style={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </nav>

        {mobileOpen && (
          <div className="cg-mobile-menu" style={styles.mobileMenu}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  ...styles.mobileNavLink,
                  ...(pathname === link.href ? styles.mobileNavLinkActive : {}),
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr style={styles.mobileDivider} />
            {isAuthenticated ? (
              <span style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                {user?.email}
              </span>
            ) : (
              <>
                <Link href="/login" style={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" style={{ ...styles.mobileNavLink, color: 'var(--color-primary)', fontWeight: 600 }} onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-border)' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto', padding: '0.875rem 1.5rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  logoText: { fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' },
  desktopNav: { display: 'flex', alignItems: 'center', gap: '0.125rem', listStyle: 'none' },
  navLink: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none', borderRadius: 'var(--radius-md)', transition: 'all 0.15s' },
  navLinkActive: { color: 'var(--color-primary)', background: 'rgb(99 102 241 / 0.08)' },
  desktopRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontSize: '0.875rem', color: 'var(--color-text-muted)' },
  mobileToggle: { display: 'none', padding: '0.375rem', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', alignItems: 'center', justifyContent: 'center' },
  mobileMenu: { display: 'flex', flexDirection: 'column', padding: '0.5rem 1.5rem 1rem', borderTop: '1px solid var(--color-border)', background: 'white' },
  mobileNavLink: { padding: '0.75rem 0.5rem', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' },
  mobileNavLinkActive: { color: 'var(--color-primary)' },
  mobileDivider: { border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' },
};
