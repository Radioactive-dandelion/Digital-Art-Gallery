import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

// Gallery / Product
import Gallery       from './pages/gallery/Gallery'
import ArtworkDetail from './pages/gallery/ArtworkDetail'
import ArtistsList   from './pages/gallery/ArtistsList'
import NotFound      from './pages/gallery/NotFound'

// Auth / User
import Login         from './pages/auth/Login'
import Register      from './pages/auth/Register'
import Profile       from './pages/auth/Profile'

// Orders
import Wishlist      from './pages/orders/Wishlist'
import Cart          from './pages/orders/Cart'
import Checkout      from './pages/orders/Checkout'
import OrderHistory  from './pages/orders/OrderHistory'
import OrderDetail   from './pages/orders/OrderDetail'

// Artist
import ArtistDashboard from './pages/artist/ArtistDashboard'
import ArtistProfile   from './pages/artist/ArtistProfile'
import UploadArtwork   from './pages/artist/UploadArtwork'
import EditArtwork     from './pages/artist/EditArtwork'
import MyEarnings      from './pages/artist/MyEarnings'

// Admin
import AdminDashboard  from './pages/admin/AdminDashboard'
import ManageUsers     from './pages/admin/ManageUsers'
import ManageProducts  from './pages/admin/ManageProducts'

const ALL_ROLES    = ['buyer', 'artist', 'admin']
const ARTIST_ADMIN = ['artist', 'admin']

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* / → /gallery */}
        <Route path='/' element={<Navigate to='/gallery' replace />} />

        {/* ── Public ── */}
        <Route path='/login'         element={<Login />} />
        <Route path='/register'      element={<Register />} />
        <Route path='/gallery'       element={<Gallery />} />
        <Route path='/gallery/:id'   element={<ArtworkDetail />} />
        <Route path='/artists'       element={<ArtistsList />} />
        <Route path='/artists/:id'   element={<ArtistProfile />} />

        {/* ── Any logged-in user ── */}
        <Route path='/profile' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><Profile /></ProtectedRoute>
        } />
        <Route path='/wishlist' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><Wishlist /></ProtectedRoute>
        } />
        <Route path='/cart' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><Cart /></ProtectedRoute>
        } />
        <Route path='/checkout' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><Checkout /></ProtectedRoute>
        } />
        <Route path='/orders' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><OrderHistory /></ProtectedRoute>
        } />
        <Route path='/orders/:id' element={
          <ProtectedRoute allowedRoles={ALL_ROLES}><OrderDetail /></ProtectedRoute>
        } />

        {/* ── Artist ── */}
        <Route path='/artist' element={
          <ProtectedRoute allowedRoles={ARTIST_ADMIN}><ArtistDashboard /></ProtectedRoute>
        } />
        <Route path='/artist/upload' element={
          <ProtectedRoute allowedRoles={ARTIST_ADMIN}><UploadArtwork /></ProtectedRoute>
        } />
        <Route path='/artist/edit/:id' element={
          <ProtectedRoute allowedRoles={ARTIST_ADMIN}><EditArtwork /></ProtectedRoute>
        } />
        <Route path='/artist/earnings' element={
          <ProtectedRoute allowedRoles={ARTIST_ADMIN}><MyEarnings /></ProtectedRoute>
        } />

        {/* ── Admin ── */}
        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path='/admin/users' element={
          <ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>
        } />
        <Route path='/admin/products' element={
          <ProtectedRoute allowedRoles={['admin']}><ManageProducts /></ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path='*' element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
