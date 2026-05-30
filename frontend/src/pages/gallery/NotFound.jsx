import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Gallery
        </Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '6rem', fontWeight: 300, color: 'var(--accent)', lineHeight: 1, marginBottom: '1rem' }}>
          404
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '0.75rem' }}>
          Page not found
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '2rem', letterSpacing: '0.04em' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to='/gallery'
          style={{ padding: '11px 28px', background: 'var(--dark)', color: 'var(--white)', textDecoration: 'none', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Jost', sans-serif" }}
        >
          Browse Gallery
        </Link>
      </div>
    </div>
  )
}

export default NotFound
