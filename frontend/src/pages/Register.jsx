import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Music2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // NORMAL REGISTER
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await register(username, email, password);

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Registration failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // GOOGLE SIGNUP
  // ============================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error('Google authentication credential is missing');
      }

      const user = await googleLogin(
        credentialResponse.credential
      );

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Google signup failed'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ============================================================
  // GOOGLE SIGNUP ERROR
  // ============================================================

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError('Google Sign-Up was cancelled or failed.');
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-3">
            <Music2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-100">
            Create an Account
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Join Fackify to listen and like tracks
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Normal Registration */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username
            </label>

            <input
              type="text"
              required
              minLength={3}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="johndoe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Signup button */}
          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />

          <span className="text-xs text-slate-500">
            OR
          </span>

          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Google Signup */}
        <div className="flex justify-center w-full">
          {googleLoading ? (
            <div className="w-full py-2.5 rounded-lg border border-slate-700 text-center text-sm text-slate-400">
              Creating account with Google...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              size="large"
              shape="rectangular"
              text="signup_with"
              width="100%"
            />
          )}
        </div>

        {/* Login */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}

          <Link
            to="/login"
            className="text-emerald-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}