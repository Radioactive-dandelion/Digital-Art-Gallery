import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const role = localStorage.getItem('role')
  const name = localStorage.getItem('name')

  return (
    <div className='home-container'>
      <div className='home-message'>

        {role ? (
          <div className='welcome-message'>
            <h3>Welcome back{name ? `, ${name}` : ''}!</h3>
            <p>What would you like to do today?</p>

            <Link to='/gallery' className='home-btn'>Go to Gallery</Link>
            <Link to='/wishlist' className='home-btn'>My Wishlist</Link>
            <Link to='/orders'   className='home-btn'>My Orders</Link>
            <Link to='/profile'  className='home-btn'>My Profile</Link>

            {role === 'artist' && (
              <Link to='/artist' className='home-btn'>Artist Dashboard</Link>
            )}
            {role === 'admin' && (
              <Link to='/admin' className='home-btn'>Admin Panel</Link>
            )}
          </div>
        ) : (
          <div className='unauthorized-message'>
            <h3>Welcome to Digital Art Gallery</h3>
            <p>Discover and purchase unique digital artworks</p>
            <Link to='/login'    className='home-btn'>Login</Link>
            <Link to='/register' className='home-btn'>Register</Link>
            <Link to='/gallery'  className='home-btn'>Browse Gallery</Link>
          </div>
        )}

      </div>
    </div>
  )
}

export default Home
