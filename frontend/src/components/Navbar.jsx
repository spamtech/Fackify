import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Music2,
  ShieldCheck,
  Heart,
  LayoutDashboard,
  ListMusic,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105 group-hover:shadow-emerald-500/30">
            <Music2 className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-black tracking-tight text-white">
              Fackify
            </div>

            <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Music for everyone
            </div>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Dashboard */}
            <Link
              to="/dashboard"
              className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive('/dashboard')
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Liked */}
            <Link
              to="/liked"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive('/liked')
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isActive('/liked')
                    ? 'fill-rose-500'
                    : 'text-rose-500'
                }`}
              />
              <span className="hidden sm:inline">Liked</span>
            </Link>

            {/* Playlists */}
            <Link
              to="/playlists"
              className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive('/playlists')
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ListMusic className="h-4 w-4" />
              Playlists
            </Link>

            {/* Admin */}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  isActive('/admin')
                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* User */}
            <div className="ml-1 flex items-center gap-2 border-l border-slate-800 pl-2 sm:ml-2 sm:pl-3">

              <div className="hidden text-right sm:block">
                <p className="max-w-28 truncate text-xs font-bold text-slate-200">
                  {user.username}
                </p>

                <p className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
                  {user.role}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 text-xs font-black text-emerald-400">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}