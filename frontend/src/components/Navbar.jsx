import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import api from '../api/axiosInstance';

import {
  LogOut,
  Music2,
  ShieldCheck,
  Heart,
  LayoutDashboard,
  ListMusic,
  Menu,
  X,
  ChevronDown,
  User,
  Bell,
  Users,
  Sparkles,
  Send,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { songColors, isPlaying } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================
     DYNAMIC "NOW PLAYING" COLORS
     Mirrors MediaPlayer.jsx so the navbar's accent colors
     shift together with the media player when a song changes.
  ========================================================= */

  const colors = songColors || {
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.18)',
    background: '#020617',
  };

  const navbarStyle = {
    '--nav-primary': colors.primary,
    '--nav-secondary': colors.secondary,
    '--nav-accent': colors.accent,
    '--nav-glow': colors.glow,
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const userMenuRef = useRef(null);

  /* =========================================================
     FETCH UNREAD MESSAGES BADGE (ADMIN ONLY)
  ========================================================= */

  const fetchUnreadCount = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/contact/admin/messages');
      if (res.data?.success) {
        setUnreadMessages(Number(res.data.unreadCount || 0));
      }
    } catch {
      // Quiet fail if not admin or network error
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000); // 15-second live badge poll
      return () => clearInterval(interval);
    }
  }, [user?.role, fetchUnreadCount]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await logout();

      setUserMenuOpen(false);
      setMobileMenuOpen(false);

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /* =========================================================
     ACTIVE ROUTE
  ========================================================= */

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* =========================================================
     CLOSE USER MENU
  ========================================================= */

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  /* =========================================================
     CLOSE USER MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  /* =========================================================
     CLOSE MENUS WHEN ROUTE CHANGES
  ========================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* =========================================================
     NAV ITEM CLASS
  ========================================================= */

  const navItemClass = (path, activeColor = 'emerald') => {
    const active = isActive(path);

    const activeClasses =
      activeColor === 'rose'
        ? `
          bg-rose-500/[0.10]
          text-white
          border-rose-400/[0.10]
          shadow-lg
          shadow-rose-500/[0.05]
        `
        : `
          bg-white/[0.07]
          text-white
          border-white/[0.08]
          shadow-lg
        `;

    const hoverClasses =
      activeColor === 'rose'
        ? `
          hover:bg-rose-500/[0.07]
          hover:text-white
          hover:border-rose-400/[0.08]
        `
        : `
          hover:bg-white/[0.055]
          hover:text-white
          hover:border-white/[0.06]
        `;

    return `
      group
      relative
      flex
      items-center
      gap-2
      rounded-2xl
      border
      px-3.5
      py-2.5
      text-xs
      font-semibold
      transition-all
      duration-300
      ${active ? activeClasses : `border-transparent text-slate-400 ${hoverClasses}`}
    `;
  };

  const navItemStyle = (path, activeColor = 'emerald') => {
    if (activeColor === 'rose' || !isActive(path)) {
      return undefined;
    }

    return {
      boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--nav-primary) 4%, transparent)`,
    };
  };

  /* =========================================================
     ICON COLOR
  ========================================================= */

  const getIconClass = (path, color = 'emerald') => {
    const active = isActive(path);

    if (color === 'rose') {
      return `
        h-4 w-4
        transition-all duration-300
        ${
          active
            ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]'
            : 'text-slate-500 group-hover:text-rose-400'
        }
      `;
    }

    return `
      h-4 w-4
      transition-all duration-300
      ${
        active
          ? ''
          : 'text-slate-500 group-hover:text-emerald-400'
      }
    `;
  };

  const getIconStyle = (path, color = 'emerald') => {
    const active = isActive(path);

    if (color === 'rose' || !active) {
      return undefined;
    }

    return {
      color: 'var(--nav-accent)',
      filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--nav-accent) 45%, transparent))`,
    };
  };

  /* =========================================================
     ACTIVE INDICATOR
  ========================================================= */

  const ActiveIndicator = ({ color = 'emerald' }) => {
    if (color === 'rose') {
      return (
        <span
          className="
            pointer-events-none
            absolute
            bottom-0.5
            left-1/2
            h-[2px]
            w-7
            -translate-x-1/2
            rounded-full
            bg-rose-400
            shadow-[0_0_10px_rgba(244,63,94,0.75)]
          "
        />
      );
    }

    return (
      <span
        className="
          pointer-events-none
          absolute
          bottom-0.5
          left-1/2
          h-[2px]
          w-7
          -translate-x-1/2
          rounded-full
          transition-colors
          duration-1000
        "
        style={{
          background: 'var(--nav-accent)',
          boxShadow: `0 0 10px color-mix(in srgb, var(--nav-accent) 75%, transparent)`,
        }}
      />
    );
  };

  if (!user) {
    return null;
  }

  return (
    <header
      style={navbarStyle}
      className="
        sticky
        top-0
        z-[100]
        px-3
        pt-3
        sm:px-4
        sm:pt-4
        lg:px-6
      "
    >
      {/* OUTER AMBIENT GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-2
          h-24
          w-[70%]
          -translate-x-1/2
          rounded-full
          blur-3xl
          transition-colors
          duration-1000
        "
        style={{ background: `color-mix(in srgb, var(--nav-primary) 7%, transparent)` }}
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[15%]
          top-0
          h-20
          w-48
          rounded-full
          blur-3xl
          transition-colors
          duration-1000
        "
        style={{ background: `color-mix(in srgb, var(--nav-secondary) 5.5%, transparent)` }}
      />

      {/* FLOATING NAVBAR */}
      <div className="relative mx-auto max-w-7xl">
        <div
          className="
            pointer-events-none
            absolute
            -inset-1
            rounded-[27px]
            opacity-80
            blur-xl
            transition-colors
            duration-1000
          "
          style={{
            background: `linear-gradient(
              90deg,
              color-mix(in srgb, var(--nav-primary) 12%, transparent),
              color-mix(in srgb, var(--nav-secondary) 4%, transparent),
              color-mix(in srgb, var(--nav-primary) 10%, transparent)
            )`,
          }}
        />

        {/* MAIN GLASS PANEL */}
        <div
          className="
            relative
            overflow-visible
            rounded-[24px]
            border
            border-white/[0.09]
            bg-slate-950/85
            shadow-2xl
            shadow-black/40
            backdrop-blur-[48px]
            backdrop-saturate-150
          "
          style={{
            boxShadow: isPlaying
              ? `0 0 45px var(--nav-glow)`
              : undefined,
          }}
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-[24px]
              transition-colors
              duration-1000
            "
            style={{
              background: `linear-gradient(
                90deg,
                color-mix(in srgb, var(--nav-primary) 4.5%, transparent),
                transparent,
                color-mix(in srgb, var(--nav-secondary) 3.5%, transparent)
              )`,
            }}
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-6
              top-0
              h-px
              transition-colors
              duration-1000
            "
            style={{
              background: `linear-gradient(
                90deg,
                transparent,
                color-mix(in srgb, var(--nav-primary) 50%, transparent),
                transparent
              )`,
            }}
          />

          {/* NAV CONTENT */}
          <div
            className="
              relative
              flex
              min-h-[92px]
              items-center
              justify-between
              gap-3
              px-3
              sm:px-5
              lg:px-6
            "
          >
            {/* LOGO */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="relative">
                <div
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    opacity-0
                    blur-xl
                    transition-all
                    duration-500
                    group-hover:opacity-100
                  "
                  style={{ background: `color-mix(in srgb, var(--nav-primary) 30%, transparent)` }}
                />

                <div
                  className="
                    relative
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-emerald-300/20
                    text-slate-950
                    shadow-lg
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:rotate-2
                  "
                  style={{
                    background: `linear-gradient(to bottom right, var(--nav-accent), var(--nav-primary), var(--nav-secondary))`,
                    boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--nav-primary) 20%, transparent)`,
                  }}
                >
                  <Music2 className="relative z-10 h-5 w-5" />
                  <div
                    className="
                      absolute
                      -left-10
                      top-0
                      h-full
                      w-6
                      rotate-12
                      bg-white/25
                      blur-sm
                      transition-all
                      duration-700
                      group-hover:left-14
                    "
                  />
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    Fackify
                  </span>
                  <span
                    className="
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/10
                      px-1.5
                      py-0.5
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-400
                    "
                  >
                    Music
                  </span>
                </div>
                <div
                  className="
                    mt-0.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-slate-600
                  "
                >
                  Music for everyone
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden items-center gap-1 xl:flex">
              <Link to="/dashboard" className={navItemClass('/dashboard')} style={navItemStyle('/dashboard')}>
                <LayoutDashboard className={getIconClass('/dashboard')} style={getIconStyle('/dashboard')} />
                <span>Dashboard</span>
                {isActive('/dashboard') && <ActiveIndicator />}
              </Link>

              <Link to="/liked" className={navItemClass('/liked', 'rose')}>
                <Heart className={getIconClass('/liked', 'rose')} />
                <span>Liked</span>
                {isActive('/liked') && <ActiveIndicator color="rose" />}
              </Link>

              {user.role !== 'admin' && (
                <Link to="/artists" className={navItemClass('/artists')} style={navItemStyle('/artists')}>
                  <Users className={getIconClass('/artists')} style={getIconStyle('/artists')} />
                  <span>Artists</span>
                  {isActive('/artists') && <ActiveIndicator />}
                </Link>
              )}

              <Link to="/playlists" className={navItemClass('/playlists')} style={navItemStyle('/playlists')}>
                <ListMusic className={getIconClass('/playlists')} style={getIconStyle('/playlists')} />
                <span>Playlists</span>
                {isActive('/playlists') && <ActiveIndicator />}
              </Link>

              {user.role !== 'admin' && (
                <Link to="/notifications" className={navItemClass('/notifications')} style={navItemStyle('/notifications')}>
                  <Bell className={getIconClass('/notifications')} style={getIconStyle('/notifications')} />
                  <span>Notifications</span>
                  {isActive('/notifications') && <ActiveIndicator />}
                </Link>
              )}

              {/* USER CONTACT LINK */}
              {user.role !== 'admin' && (
                <Link to="/contact" className={navItemClass('/contact')} style={navItemStyle('/contact')}>
                  <Send className={getIconClass('/contact')} style={getIconStyle('/contact')} />
                  <span>Contact</span>
                  {isActive('/contact') && <ActiveIndicator />}
                </Link>
              )}

              <Link to="/profile" className={navItemClass('/profile')} style={navItemStyle('/profile')}>
                <User className={getIconClass('/profile')} style={getIconStyle('/profile')} />
                <span>Profile</span>
                {isActive('/profile') && <ActiveIndicator />}
              </Link>

              {/* ADMIN LINK WITH REAL-TIME UNREAD COUNTER BADGE */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="
                    ml-1
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-emerald-400/20
                    bg-emerald-400/[0.07]
                    px-3.5
                    py-2.5
                    text-xs
                    font-bold
                    text-emerald-400
                    shadow-lg
                    shadow-emerald-500/[0.04]
                    transition-all
                    duration-300
                    hover:border-emerald-400/30
                    hover:bg-emerald-400/[0.12]
                    hover:shadow-emerald-500/10
                    relative
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                  {unreadMessages > 0 && (
                    <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-bounce shadow-md">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              )}

              {/* SOCIAL CONNECTION */}
            </nav>

            {/* RIGHT SIDE USER AVATAR & DROPDOWN */}
            <div className="flex items-center gap-2">
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((previous) => !previous)}
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-transparent
                    px-1.5
                    py-1.5
                    transition-all
                    duration-300
                    hover:border-white/[0.08]
                    hover:bg-white/[0.045]
                  "
                >
                  <div className="relative">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-emerald-400/20
                        bg-gradient-to-br
                        from-emerald-500/20
                        via-teal-500/10
                        to-cyan-500/10
                        text-xs
                        font-black
                        text-emerald-400
                        shadow-inner
                        shadow-emerald-400/[0.04]
                        transition-all
                        duration-300
                        group-hover:border-emerald-400/30
                        group-hover:shadow-lg
                        group-hover:shadow-emerald-500/10
                      "
                    >
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <span
                      className="
                        absolute
                        -bottom-0.5
                        -right-0.5
                        h-2.5
                        w-2.5
                        rounded-full
                        border-2
                        border-slate-950
                        bg-emerald-400
                        shadow-[0_0_8px_rgba(52,211,153,0.8)]
                      "
                    />
                  </div>

                  <div className="hidden max-w-28 text-left sm:block">
                    <p className="truncate text-xs font-bold text-slate-200">
                      {user.username}
                    </p>
                    <p
                      className="
                        mt-0.5
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-slate-600
                      "
                    >
                      {user.role}
                    </p>
                  </div>

                  <ChevronDown
                    className={`
                      hidden
                      h-3.5
                      w-3.5
                      text-slate-600
                      transition-transform
                      duration-300
                      sm:block
                      ${userMenuOpen ? 'rotate-180 text-emerald-400' : ''}
                    `}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-[calc(100%+12px)]
                      z-[200]
                      w-72
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-white/[0.10]
                      bg-slate-950/90
                      shadow-2xl
                      shadow-black/60
                      backdrop-blur-[48px]
                      backdrop-saturate-150
                    "
                  >
                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-24
                        bg-gradient-to-b
                        from-emerald-500/[0.09]
                        to-transparent
                      "
                    />

                    <div
                      className="
                        relative
                        border-b
                        border-white/[0.07]
                        p-4
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-emerald-400/20
                            bg-gradient-to-br
                            from-emerald-500/20
                            to-cyan-500/10
                            text-sm
                            font-black
                            text-emerald-400
                            shadow-lg
                            shadow-emerald-500/10
                          "
                        >
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {user.username}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-slate-500">
                            {user.email}
                          </p>
                          <div
                            className="
                              mt-2
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              border-emerald-400/10
                              bg-emerald-400/[0.06]
                              px-2
                              py-1
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-emerald-400
                            "
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={closeUserMenu}
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-slate-400
                          transition-all
                          duration-200
                          hover:bg-white/[0.05]
                          hover:text-white
                        "
                      >
                        <User className="h-4 w-4 text-emerald-400" />
                        Profile
                      </Link>

                      {user.role !== 'admin' && (
                        <Link
                          to="/contact"
                          onClick={closeUserMenu}
                          className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-400
                            transition-all
                            duration-200
                            hover:bg-white/[0.05]
                            hover:text-white
                          "
                        >
                          <Send className="h-4 w-4 text-emerald-400" />
                          Contact Support
                        </Link>
                      )}

                      {user.role !== 'admin' && (
                        <Link
                          to="/artists"
                          onClick={closeUserMenu}
                          className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-400
                            transition-all
                            duration-200
                            hover:bg-white/[0.05]
                            hover:text-white
                          "
                        >
                          <Users className="h-4 w-4 text-emerald-400" />
                          Artists
                        </Link>
                      )}

                      <Link
                        to="/playlists"
                        onClick={closeUserMenu}
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-slate-400
                          transition-all
                          duration-200
                          hover:bg-white/[0.05]
                          hover:text-white
                        "
                      >
                        <ListMusic className="h-4 w-4 text-emerald-400" />
                        My Playlists
                      </Link>

                      {user.role !== 'admin' && (
                        <Link
                          to="/notifications"
                          onClick={closeUserMenu}
                          className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-400
                            transition-all
                            duration-200
                            hover:bg-white/[0.05]
                            hover:text-white
                          "
                        >
                          <Bell className="h-4 w-4 text-emerald-400" />
                          Notifications
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={closeUserMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            px-3
                            py-2.5
                            text-xs
                            font-semibold
                            text-slate-400
                            transition-all
                            duration-200
                            hover:bg-emerald-500/[0.06]
                            hover:text-emerald-400
                          "
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span>Admin Panel</span>
                          </div>
                          {unreadMessages > 0 && (
                            <span className="h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/[0.06] p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-400 hover:bg-rose-500/[0.08] hover:text-rose-400 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE MENU TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((previous) => !previous)}
                aria-label="Toggle navigation menu"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.035]
                  text-slate-400
                  shadow-inner
                  shadow-white/[0.02]
                  transition-all
                  duration-300
                  hover:border-emerald-400/20
                  hover:bg-emerald-500/[0.06]
                  hover:text-white
                  md:flex
                  xl:hidden
                "
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE NAVIGATION DRAWER */}
          {mobileMenuOpen && (
            <div
              className="
                relative
                border-t
                border-white/[0.07]
                bg-slate-950/90
                px-3
                pb-3
                pt-3
                backdrop-blur-[40px]
                backdrop-saturate-150
                xl:hidden
              "
            >
              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                  Dashboard
                </Link>

                <Link
                  to="/liked"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-rose-500/[0.05] hover:text-white transition"
                >
                  <Heart className="h-4 w-4 text-rose-400" />
                  Liked Songs
                </Link>

                {user.role !== 'admin' && (
                  <Link
                    to="/artists"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
                  >
                    <Users className="h-4 w-4 text-emerald-400" />
                    Artists
                  </Link>
                )}

                <Link
                  to="/playlists"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
                >
                  <ListMusic className="h-4 w-4 text-emerald-400" />
                  Playlists
                </Link>

                {user.role !== 'admin' && (
                  <Link
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
                  >
                    <Bell className="h-4 w-4 text-emerald-400" />
                    Notifications
                  </Link>
                )}

                {/* USER CONTACT LINK IN MOBILE MENU */}
                {user.role !== 'admin' && (
                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-emerald-500/[0.05] hover:text-white transition"
                  >
                    <Send className="h-4 w-4 text-emerald-400" />
                    Contact Support
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
                >
                  <User className="h-4 w-4 text-emerald-400" />
                  Profile
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs font-semibold text-emerald-400 transition"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </div>
                    {unreadMessages > 0 && (
                      <span className="h-5 px-2 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}