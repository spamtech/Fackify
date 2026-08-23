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
                GLOBAL MEDIA PLAYER
            ================================================== */}

            <MediaPlayer />

          </div>

        </PlayerProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}