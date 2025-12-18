'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set noindex for auth pages
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetMessage('Check your email for a password reset link');
      setResetEmail('');
      setShowResetForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Color Chase</h1>
        <p className="text-center text-slate-300 mb-6 text-sm">Sign in to continue</p>

        {resetMessage && (
          <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg border border-green-700">
            {resetMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {!showResetForm ? (
          <>
            <form onSubmit={handleSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-slate-200 font-semibold hover:bg-slate-800 hover:border-slate-500 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 space-y-3 text-center text-sm">
              <button
                onClick={() => setShowResetForm(true)}
                className="text-purple-400 hover:text-purple-300 block w-full transition"
              >
                Forgot your password?
              </button>
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-slate-300 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetForm(false)}
              className="w-full text-purple-400 hover:text-purple-300 font-semibold py-2 transition"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
