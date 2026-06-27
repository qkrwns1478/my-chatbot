'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-page-bg font-sans">
      <div className="w-full max-w-md p-10 bg-surface-dark rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-border-subtle relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />

        <h1 className="text-[42px] font-normal leading-[1] tracking-[-1.2px] text-text-primary mb-2 text-center">
          Login
        </h1>
        <p className="text-[14px] text-text-muted mb-10 text-center tracking-[-0.2px]">
          Welcome back to Neon Character Chat
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-12 px-4 rounded-xl border border-border-subtle bg-surface-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all duration-200"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-mono uppercase tracking-[0.12em] text-text-muted px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-border-subtle bg-surface-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all duration-200"
              required
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <p className="text-error text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 bg-brand-green text-black rounded-xl font-bold hover:bg-brand-green-mid transform active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(0,229,153,0.15)] hover:shadow-[0_0_25px_rgba(0,229,153,0.25)]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border-subtle text-center">
          <p className="text-[14px] text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-green hover:text-brand-green-mid font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
