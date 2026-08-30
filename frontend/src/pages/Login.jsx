import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Music2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Headphones,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Login failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error(
          'Google authentication credential is missing'
        );
      }

      const loggedInUser = await googleLogin(
        credentialResponse.credential
      );

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Google login failed'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN ERROR
  // ============================================================

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError('Google Sign-In was cancelled or failed.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] flex items-center justify-center px-4 py-10">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Main glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />

        {/* Floating music icons */}
        <Music2 className="absolute top-[15%] left-[10%] w-7 h-7 text-emerald-400/10 animate-pulse" />

        <Headphones className="absolute top-[25%] right-[12%] w-8 h-8 text-cyan-400/10 animate-pulse" />

        <Music2 className="absolute bottom-[18%] left-[15%] w-6 h-6 text-purple-400/10 animate-pulse" />

        <Sparkles className="absolute bottom-[25%] right-[15%] w-7 h-7 text-emerald-400/10 animate-pulse" />
      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="relative z-10 w-full max-w-[430px]">

        {/* Brand */}
        <div className="text-center mb-7">

          <div className="inline-flex items-center gap-2 mb-4">

            <div className="relative">

              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-30" />

              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">

                <Music2
                  className="w-6 h-6 text-slate-950"
                  strokeWidth={2.5}
                />

              </div>
            </div>

            <span className="text-2xl font-black tracking-tight text-white">
              Fackify
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Your music. Your mood. Your world.
          </p>
        </div>

        {/* ======================================================
            CARD
        ====================================================== */}

        <div className="relative">

          {/* Card glow */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-b from-emerald-500/30 via-transparent to-cyan-500/20 blur-sm opacity-70" />

          <div className="relative rounded-[28px] border border-white/[0.08] bg-slate-900/75 backdrop-blur-2xl shadow-2xl shadow-black/40 p-7 sm:p-8">

            {/* Header */}

            <div className="mb-7">

              <div className="flex items-center gap-2 mb-2">

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Welcome back
                </span>

                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />

              </div>

              <h1 className="text-3xl font-bold text-white tracking-tight">
                Sign in to Fackify
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Continue listening to your favorite music.
              </p>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-3 flex items-start gap-3">

                <div className="mt-0.5 w-2 h-2 rounded-full bg-rose-400 shadow-lg shadow-rose-500/50 flex-shrink-0" />

                <p className="text-xs leading-relaxed text-rose-300">
                  {error}
                </p>

              </div>
            )}

            {/* ==================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Email address
                </label>

                <div className="relative group">

                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500 group-focus-within:text-emerald-400 transition"
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700"
                    placeholder="you@example.com"
                  />

                </div>
              </div>

              {/* Password */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Password
                </label>

                <div className="relative group">

                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500 group-focus-within:text-emerald-400 transition"
                  />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full h-12 pl-11 pr-12 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>
              </div>

              {/* Login button */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  googleLoading
                }
                className="group relative w-full h-12 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >

                <span className="relative z-10 flex items-center justify-center gap-2">

                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </span>

              </button>

            </form>

            {/* ==================================================
                DIVIDER
            ================================================== */}

            <div className="flex items-center gap-4 my-6">

              <div className="flex-1 h-px bg-slate-800" />

              <span className="text-[10px] font-bold tracking-widest text-slate-600">
                OR CONTINUE WITH
              </span>

              <div className="flex-1 h-px bg-slate-800" />

            </div>

            {/* ==================================================
                GOOGLE
            ================================================== */}

            <div className="w-full flex justify-center overflow-hidden rounded-xl">

              {googleLoading ? (
                <div className="w-full h-12 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-center gap-2 text-sm text-slate-400">

                  <span className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />

                  Signing in with Google...

                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                  width="100%"
                />
              )}

            </div>

            {/* ==================================================
                REGISTER
            ================================================== */}

            <div className="mt-7 pt-6 border-t border-slate-800/80">

              <p className="text-center text-xs text-slate-500">

                Don't have an account?{' '}

                <Link
                  to="/register"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Create your account
                </Link>

              </p>

            </div>

          </div>
        </div>

        {/* Bottom text */}

        <p className="text-center text-[10px] text-slate-700 mt-6 tracking-wide">
          FACKIFY • MUSIC STREAMING PLATFORM
        </p>

      </div>
    </div>
  );
}