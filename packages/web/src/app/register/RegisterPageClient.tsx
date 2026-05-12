'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
      // TODO: Implement registration API call
      console.log('Registration attempt', { email, password, name });
      // Simulate successful registration
      router.push('/login');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerApi(email, password);
      if (res.error || !res.data) {
        throw new Error(typeof res.error === 'string' ? res.error : (res.error?.message || 'Registration failed'));
      }
      login(res.data.token, res.data.user);
      router.push('/history');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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

          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join professional stylists using AI-powered color formulation.</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name (optional)</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="form-input"
                disabled={isLoading}
              />
            </div>

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
              <p className="form-hint">At least 8 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirm" className="form-label">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading || !email || !password || !confirmPassword}
              style={styles.submitBtn}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" style={styles.footerLink}>
                Sign in
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
