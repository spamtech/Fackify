import React, { useEffect, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

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
  MessageCircle,
  Instagram,
  Users,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const userMenuRef = useRef(null);

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
      console.error(
        'Logout error:',
        error
      );
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

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
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
          shadow-emerald-500/[0.04]
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

  /* =========================================================
     ICON COLOR
  ========================================================= */

  const getIconClass = (
    path,
    color = 'emerald'
  ) => {
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
          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]'
          : 'text-slate-500 group-hover:text-emerald-400'
      }
    `;
  };

  /* =========================================================
     ACTIVE INDICATOR
  ========================================================= */

  const ActiveIndicator = ({
    color = 'emerald',
  }) => {
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
          bg-emerald-400
          shadow-[0_0_10px_rgba(52,211,153,0.75)]
        "
      />
    );
  };

  /* =========================================================
     NO USER
  ========================================================= */

  if (!user) {
    return null;
  }

  return (
    <header
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
      {/* =====================================================
          OUTER AMBIENT GLOW
      ====================================================== */}

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
          bg-emerald-500/[0.07]
          blur-3xl
        "
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
          bg-cyan-500/[0.055]
          blur-3xl
        "
      />

      {/* =====================================================
          FLOATING NAVBAR
      ====================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
        "
      >
        {/* ===================================================
            OUTER GLOW LAYER
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -inset-1
            rounded-[27px]
            bg-gradient-to-r
            from-emerald-500/[0.12]
            via-cyan-500/[0.04]
            to-emerald-500/[0.10]
            opacity-80
            blur-xl
          "
        />

        {/* ===================================================
            MAIN GLASS PANEL
        ==================================================== */}

        <div
          className="
            relative
            overflow-visible
            rounded-[24px]
            border
            border-white/[0.09]
            bg-slate-950/55
            shadow-2xl
            shadow-black/40
            backdrop-blur-[32px]
            backdrop-saturate-150
          "
        >
          {/* =================================================
              INNER GRADIENT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-[24px]
              bg-gradient-to-r
              from-emerald-500/[0.045]
              via-transparent
              to-cyan-500/[0.035]
            "
          />

          {/* =================================================
              TOP LIGHT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-6
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-emerald-300/50
              to-transparent
            "
          />

          {/* =================================================
              LEFT LIGHT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-1/2
              h-20
              w-20
              -translate-y-1/2
              rounded-full
              bg-emerald-400/[0.04]
              blur-2xl
            "
          />

          {/* =================================================
              RIGHT LIGHT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-1/2
              h-20
              w-20
              -translate-y-1/2
              rounded-full
              bg-cyan-400/[0.035]
              blur-2xl
            "
          />

          {/* =================================================
              NAV CONTENT
          ================================================== */}

          <div
            className="
              relative
              flex
              min-h-[76px]
              items-center
              justify-between
              gap-3
              px-3
              sm:px-5
              lg:px-6
            "
          >
            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                group
                flex
                shrink-0
                items-center
                gap-3
              "
            >
              {/* Logo Icon */}

              <div className="relative">
                <div
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    bg-emerald-400/30
                    opacity-0
                    blur-xl
                    transition-all
                    duration-500
                    group-hover:opacity-100
                  "
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
                    bg-gradient-to-br
                    from-emerald-300
                    via-emerald-500
                    to-cyan-500
                    text-slate-950
                    shadow-lg
                    shadow-emerald-500/20
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:rotate-2
                  "
                >
                  <Music2
                    className="
                      relative
                      z-10
                      h-5
                      w-5
                    "
                  />

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

              {/* Logo Text */}

              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span
                    className="
                      text-lg
                      font-black
                      tracking-tight
                      text-white
                    "
                  >
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

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav
              className="
                hidden
                items-center
                gap-1
                xl:flex
              "
            >
              {/* Dashboard */}

              <Link
                to="/dashboard"
                className={navItemClass(
                  '/dashboard'
                )}
              >
                <LayoutDashboard
                  className={getIconClass(
                    '/dashboard'
                  )}
                />

                <span>
                  Dashboard
                </span>

                {isActive(
                  '/dashboard'
                ) && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* Liked */}

              <Link
                to="/liked"
                className={navItemClass(
                  '/liked',
                  'rose'
                )}
              >
                <Heart
                  className={getIconClass(
                    '/liked',
                    'rose'
                  )}
                />

                <span>
                  Liked
                </span>

                {isActive('/liked') && (
                  <ActiveIndicator color="rose" />
                )}
              </Link>

              {/* Artists */}

              {user.role !== 'admin' && (
                <Link
                  to="/artists"
                  className={navItemClass(
                    '/artists'
                  )}
                >
                  <Users
                    className={getIconClass(
                      '/artists'
                    )}
                  />

                  <span>
                    Artists
                  </span>

                  {isActive(
                    '/artists'
                  ) && (
                    <ActiveIndicator />
                  )}
                </Link>
              )}

              {/* Playlists */}

              <Link
                to="/playlists"
                className={navItemClass(
                  '/playlists'
                )}
              >
                <ListMusic
                  className={getIconClass(
                    '/playlists'
                  )}
                />

                <span>
                  Playlists
                </span>

                {isActive(
                  '/playlists'
                ) && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* Notifications */}

              {user.role !== 'admin' && (
                <Link
                  to="/notifications"
                  className={navItemClass(
                    '/notifications'
                  )}
                >
                  <Bell
                    className={getIconClass(
                      '/notifications'
                    )}
                  />

                  <span>
                    Notifications
                  </span>

                  {isActive(
                    '/notifications'
                  ) && (
                    <ActiveIndicator />
                  )}
                </Link>
              )}

              {/* Profile */}

              <Link
                to="/profile"
                className={navItemClass(
                  '/profile'
                )}
              >
                <User
                  className={getIconClass(
                    '/profile'
                  )}
                />

                <span>
                  Profile
                </span>

                {isActive('/profile') && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* =================================================
                  ADMIN
              ================================================== */}

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
                  "
                >
                  <ShieldCheck className="h-4 w-4" />

                  Admin
                </Link>
              )}

              {/* =================================================
                  SOCIAL CONNECTION
              ================================================== */}

              {user.role !== 'admin' && (
                <div
                  className="
                    ml-1
                    flex
                    items-center
                    gap-1
                    border-l
                    border-white/[0.06]
                    pl-2
                  "
                >
                  {/* WhatsApp */}

                  <a
                    href="https://wa.me/917810828802"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Contact Admin on WhatsApp"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-emerald-500/15
                      bg-emerald-500/[0.04]
                      text-emerald-400
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:border-emerald-400/30
                      hover:bg-emerald-500/10
                      hover:text-emerald-300
                      hover:shadow-lg
                      hover:shadow-emerald-500/10
                    "
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>

                  {/* Instagram */}

                  <a
                    href="https://instagram.com/YOUR_INSTAGRAM_USERNAME"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow Admin on Instagram"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-pink-500/15
                      bg-pink-500/[0.04]
                      text-pink-400
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:border-pink-400/30
                      hover:bg-pink-500/10
                      hover:text-pink-300
                      hover:shadow-lg
                      hover:shadow-pink-500/10
                    "
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              )}
            </nav>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="flex items-center gap-2">
              {/* =================================================
                  USER MENU
              ================================================== */}

              <div
                ref={userMenuRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setUserMenuOpen(
                      (previous) =>
                        !previous
                    )
                  }
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
                  {/* Avatar */}

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
                      {user.username
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        'U'}
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

                  {/* User Info */}

                  <div
                    className="
                      hidden
                      max-w-28
                      text-left
                      sm:block
                    "
                  >
                    <p
                      className="
                        truncate
                        text-xs
                        font-bold
                        text-slate-200
                      "
                    >
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
                      ${
                        userMenuOpen
                          ? 'rotate-180 text-emerald-400'
                          : ''
                      }
                    `}
                  />
                </button>

                {/* =================================================
                    USER DROPDOWN
                ================================================== */}

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
                      bg-slate-950/70
                      shadow-2xl
                      shadow-black/60
                      backdrop-blur-[35px]
                      backdrop-saturate-150
                    "
                  >
                    {/* Dropdown Glow */}

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

                    {/* Top Border */}

                    <div
                      className="
                        absolute
                        inset-x-8
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-emerald-300/40
                        to-transparent
                      "
                    />

                    {/* Profile Header */}

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
                          {user.username
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            'U'}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              text-sm
                              font-bold
                              text-white
                            "
                          >
                            {user.username}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-[10px]
                              text-slate-500
                            "
                          >
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

                    {/* Quick Links */}

                    <div className="p-2">
                      {/* Profile */}

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
                        <User
                          className="
                            h-4
                            w-4
                            text-emerald-400
                            transition-transform
                            duration-200
                            group-hover:scale-110
                          "
                        />

                        Profile
                      </Link>

                      {/* Artists */}

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
                          <Users
                            className="
                              h-4
                              w-4
                              text-emerald-400
                              transition-transform
                              duration-200
                              group-hover:scale-110
                            "
                          />

                          Artists
                        </Link>
                      )}

                      {/* Playlists */}

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
                        <ListMusic
                          className="
                            h-4
                            w-4
                            text-emerald-400
                            transition-transform
                            duration-200
                            group-hover:scale-110
                          "
                        />

                        My Playlists
                      </Link>

                      {/* Notifications */}

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
                          <Bell
                            className="
                              h-4
                              w-4
                              text-emerald-400
                              transition-transform
                              duration-200
                              group-hover:scale-110
                            "
                          />

                          Notifications
                        </Link>
                      )}

                      {/* Admin */}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
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
                            hover:bg-emerald-500/[0.06]
                            hover:text-emerald-400
                          "
                        >
                          <ShieldCheck
                            className="
                              h-4
                              w-4
                              text-emerald-400
                            "
                          />

                          Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* Connect */}

                    {user.role !== 'admin' && (
                      <div
                        className="
                          border-t
                          border-white/[0.06]
                          p-2
                        "
                      >
                        <p
                          className="
                            px-3
                            py-2
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-slate-600
                          "
                        >
                          Connect with Admin
                        </p>

                        {/* WhatsApp */}

                        <a
                          href="https://wa.me/917810828802"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
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
                            hover:bg-emerald-500/[0.08]
                            hover:text-emerald-400
                          "
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-400" />

                          WhatsApp
                        </a>

                        {/* Instagram */}

                        <a
                          href="https://instagram.com/YOUR_INSTAGRAM_USERNAME"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
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
                            hover:bg-pink-500/[0.08]
                            hover:text-pink-400
                          "
                        >
                          <Instagram className="h-4 w-4 text-pink-400" />

                          Instagram
                        </a>
                      </div>
                    )}

                    {/* Logout */}

                    <div
                      className="
                        border-t
                        border-white/[0.06]
                        p-2
                      "
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          text-xs
                          font-semibold
                          text-slate-400
                          transition-all
                          duration-200
                          hover:bg-rose-500/[0.08]
                          hover:text-rose-400
                        "
                      >
                        <LogOut className="h-4 w-4" />

                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (previous) =>
                      !previous
                  )
                }
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

          {/* =================================================
              MOBILE NAVIGATION
          ================================================== */}

          {mobileMenuOpen && (
            <div
              className="
                relative
                border-t
                border-white/[0.07]
                bg-slate-950/35
                px-3
                pb-3
                pt-3
                backdrop-blur-2xl
                xl:hidden
              "
            >
              <nav className="space-y-1">
                {/* Dashboard */}

                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-transparent
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-slate-400
                    transition-all
                    hover:border-white/[0.06]
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" />

                  Dashboard
                </Link>

                {/* Liked */}

                <Link
                  to="/liked"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-transparent
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-slate-400
                    transition-all
                    hover:border-rose-400/[0.06]
                    hover:bg-rose-500/[0.05]
                    hover:text-white
                  "
                >
                  <Heart className="h-4 w-4 text-rose-400" />

                  Liked Songs
                </Link>

                {/* Artists */}

                {user.role !== 'admin' && (
                  <Link
                    to="/artists"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-transparent
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-slate-400
                      transition-all
                      hover:border-white/[0.06]
                      hover:bg-white/[0.05]
                      hover:text-white
                    "
                  >
                    <Users className="h-4 w-4 text-emerald-400" />

                    Artists
                  </Link>
                )}

                {/* Playlists */}

                <Link
                  to="/playlists"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-transparent
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-slate-400
                    transition-all
                    hover:border-white/[0.06]
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <ListMusic className="h-4 w-4 text-emerald-400" />

                  Playlists
                </Link>

                {/* Notifications */}

                {user.role !== 'admin' && (
                  <Link
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-transparent
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-slate-400
                      transition-all
                      hover:border-white/[0.06]
                      hover:bg-white/[0.05]
                      hover:text-white
                    "
                  >
                    <Bell className="h-4 w-4 text-emerald-400" />

                    Notifications
                  </Link>
                )}

                {/* Profile */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-transparent
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-slate-400
                    transition-all
                    hover:border-white/[0.06]
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <User className="h-4 w-4 text-emerald-400" />

                  Profile
                </Link>

                {/* Admin */}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.05]
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-emerald-400
                      transition-all
                      hover:border-emerald-400/25
                      hover:bg-emerald-400/[0.09]
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />

                    Admin Panel
                  </Link>
                )}

                {/* =================================================
                    CONNECT
                ================================================== */}

                {user.role !== 'admin' && (
                  <div
                    className="
                      mt-2
                      border-t
                      border-white/[0.06]
                      pt-2
                    "
                  >
                    <p
                      className="
                        px-4
                        py-2
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-slate-600
                      "
                    >
                      Connect with Admin
                    </p>

                    {/* WhatsApp */}

                    <a
                      href="https://wa.me/917810828802"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-3
                        text-xs
                        font-semibold
                        text-slate-400
                        transition-all
                        hover:bg-emerald-500/[0.07]
                        hover:text-emerald-400
                      "
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />

                      WhatsApp
                    </a>

                    {/* Instagram */}

                    <a
                      href="https://instagram.com/YOUR_INSTAGRAM_USERNAME"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-3
                        text-xs
                        font-semibold
                        text-slate-400
                        transition-all
                        hover:bg-pink-500/[0.07]
                        hover:text-pink-400
                      "
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />

                      Instagram
                    </a>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          NAVBAR ANIMATIONS
      ====================================================== */}

      <style>{`
        @keyframes fackifyNavbarGlow {
          0% {
            opacity: 0.45;
            transform: scaleX(0.92);
          }

          50% {
            opacity: 0.8;
            transform: scaleX(1);
          }

          100% {
            opacity: 0.45;
            transform: scaleX(0.92);
          }
        }

        .fackify-navbar-glow {
          animation: fackifyNavbarGlow 5s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}