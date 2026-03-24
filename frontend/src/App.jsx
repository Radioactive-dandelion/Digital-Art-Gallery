import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Profile from './pages/user/Profile'

// Protected routes
import ProtectedRoute from './components/ProtectedRoute'

// (пока заглушки — потом создадим)
import ArtistDashboard from './pages/artist/ArtistDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import Gallery from './pages/gallery/Gallery'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Gallery (можно открыть всем или только авторизованным — решишь позже) */}
        <Route path="/gallery" element={<Gallery />} />

        {/* Profile (любой залогиненный пользователь) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'artist', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Artist panel */}
        <Route
          path="/artist"
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App