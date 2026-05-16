import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='home-container'>
      <div className='home-message'>
        <div className='unauthorized-message'>
          <h3 style={{ fontSize: '4rem', fontWeight: 300, marginBottom: '0.5rem' }}>404</h3>
          <h3>Page not found</h3>
          <p>The page you're looking for doesn't exist.</p>
          <Link to='/'       className='home-btn'>Go Home</Link>
          <Link to='/gallery' className='home-btn'>Browse Gallery</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
