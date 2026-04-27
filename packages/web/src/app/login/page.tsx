'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implement login API call
      console.log('Login attempt', { email, password });
      // Simulate successful login
      router.push('/dashboard');
      router.push('/history');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
      
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.card} className="card">
        <div className="card-body" style={styles.body}>
          {/* Logo */}
          <div style={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" fill="#6366F1" />
              <circle cx="16" cy="16" r="8" fill="#F59E0B" />
              <circle cx="16" cy="16" r="4" fill="#ffffff" />
            </svg>
            <span style={styles.logoText}>ColorGenius</span>
          </div>

          <h1 style={styles.title}>Sign In</h1>
          <p style={styles.subtitle}>Welcome back! Sign in to access your analysis history.</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@salon.com"
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading || !email || !password}
              style={styles.submitBtn}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={styles.footerLink}>
                Create one
              </Link>
            </p>
            <Link href="/" style={styles.backLink}>← Back to home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'var(--color-bg)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    textAlign: 'center',
    marginBottom: '-0.5rem',
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  submitBtn: {
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  footerLink: {
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  backLink: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-light)',
  },
};
