import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi } from '../api/axios'

function Navbar() {
  const navigate  = useNavigate()
  const role      = localStorage.getItem('role')
  const name      = localStorage.getItem('name')
  const isLoggedIn = !!role

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <div className='nav-left'>
        <Link to='/'>Home</Link>
        <Link to='/gallery'>Gallery</Link>
        <Link to='/artists'>Artists</Link>
        {role === 'artist' && <Link to='/artist'>Dashboard</Link>}
        {role === 'admin'  && <Link to='/admin'>Admin</Link>}
      </div>

      <div className='nav-right'>
        {!isLoggedIn ? (
          <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.8rem', color: '#777' }}>{name} ({role})</span>
            <Link to='/wishlist'>Wishlist</Link>
            <Link to='/cart'>Cart</Link>
            <Link to='/orders'>Orders</Link>
            <Link to='/profile'>Profile</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
