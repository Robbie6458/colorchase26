'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { supabase } from '@/app/lib/supabase';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState(profile?.username || '');
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Not logged in</h2>
          <p className="text-slate-300 mb-6">Please log in to view your profile.</p>
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ playerName, emailNotifications })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition">
            ← Back to Game
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg border border-green-700">
            {success}
          </div>
        )}

        {/* Account Info Section */}
        <div className="mb-8 pb-8 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-300"
              />
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-slate-200 mb-1">
                  Player Name
                </label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || (playerName === profile.username && emailNotifications === profile.email_notifications)}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Section */}
        <div className="mb-8 pb-8 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white mb-4">Password</h2>
          
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-200 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-200 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="text-slate-400 hover:text-slate-300 font-semibold py-3 px-6 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Notification Settings */}
        <div className="mb-8 pb-8 border-b border-slate-600">
          <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-600">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Daily Reminder Emails</h3>
              <p className="text-slate-400 text-sm">
                Get notified a few hours before the daily palette expires
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Account Created</h2>
          <p className="text-slate-300">
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 hover:shadow-lg transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
