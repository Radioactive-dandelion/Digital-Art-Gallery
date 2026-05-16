import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className='footer'>
      <span>© {new Date().getFullYear()} Digital Art Gallery</span>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to='/gallery' style={{ color: 'inherit', textDecoration: 'none' }}>Gallery</Link>
        <Link to='/artists' style={{ color: 'inherit', textDecoration: 'none' }}>Artists</Link>
        <a href='mailto:support@gallery.com' style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
      </div>
    </footer>
  )
}

export default Footer
