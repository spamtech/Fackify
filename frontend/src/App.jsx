import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>

          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

            <Navbar />

            <main className="flex-1">
              <Routes>

                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* User + Admin */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']} />
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/liked" element={<LikedSongs />} />
                  <Route path="/playlists" element={<Playlists />} />
                </Route>

                {/* Admin only */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['admin']} />
                  }
                >
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Unknown route */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />

              </Routes>
            </main>

            <MediaPlayer />

          </div>

        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}