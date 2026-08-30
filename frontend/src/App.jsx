import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import Navbar from './components/Navbar';
import MediaPlayer from './components/MediaPlayer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LikedSongs from './pages/LikedSongs';
import Playlists from './pages/Playlists';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Contact from './pages/Contact';

/* ============================================================
   ARTIST PAGES
============================================================ */

import Artists from './pages/Artists';
import ArtistDetails from './pages/ArtistDetails';

import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <PlayerProvider>

          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

            {/* =========================
                NAVBAR
            ========================== */}

            <Navbar />


            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="flex-1">

              <Routes>

                {/* ==================================================
                    PUBLIC ROUTES
                ================================================== */}

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/register"
                  element={<Register />}
                />


                {/* ==================================================
                    HOME REDIRECT
                ================================================== */}

                <Route
                  path="/"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />


                {/* ==================================================
                    USER + ADMIN ROUTES
                ================================================== */}

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['user', 'admin']}
                    />
                  }
                >

                  {/* Dashboard */}

                  <Route
                    path="/dashboard"
                    element={<Dashboard />}
                  />


                  {/* Profile */}

                  <Route
                    path="/profile"
                    element={<Profile />}
                  />


                  {/* Liked Songs */}

                  <Route
                    path="/liked"
                    element={<LikedSongs />}
                  />


                  {/* Playlists */}

                  <Route
                    path="/playlists"
                    element={<Playlists />}
                  />


                  {/* Notifications */}

                  <Route
                    path="/notifications"
                    element={<Notifications />}
                  />


                  {/* Contact Support */}

                  <Route
                    path="/contact"
                    element={<Contact />}
                  />


                  {/* ==================================================
                      ARTISTS
                  ================================================== */}

                  <Route
                    path="/artists"
                    element={<Artists />}
                  />

                  <Route
                    path="/artists/:id"
                    element={<ArtistDetails />}
                  />

                </Route>


                {/* ==================================================
                    ADMIN ONLY
                ================================================== */}

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['admin']}
                    />
                  }
                >

                  <Route
                    path="/admin"
                    element={<AdminDashboard />}
                  />

                </Route>


                {/* ==================================================
                    UNKNOWN ROUTE
                ================================================== */}

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

              </Routes>

            </main>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">

              <div className="max-w-7xl mx-auto px-6 py-6">

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                  {/* Brand */}

                  <div className="flex items-center gap-2">

                    <span className="text-lg font-black tracking-tight bg-gradient-to-r from-green-400 via-green-400 to-green-500 bg-clip-text text-transparent">
                      Fackify
                    </span>

                    <span className="text-slate-600">
                      •
                    </span>

                    <span className="text-sm text-slate-400">
                      Your Music. Your Vibe.
                    </span>

                  </div>


                  {/* Creator */}

                  <div className="text-sm text-slate-400 text-center">

                    © {new Date().getFullYear()} Fackify

                    <span className="mx-2 text-slate-600">
                      |
                    </span>

                    Created by{' '}

                    <span className="font-semibold text-slate-200">
                      NodeMon
                    </span>

                  </div>

                </div>

              </div>

            </footer>


            {/* ==================================================
                GLOBAL MEDIA PLAYER
            ================================================== */}

            <MediaPlayer />

          </div>

        </PlayerProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}