import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productApi } from '../../api/axios'

function ArtistsList() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    productApi.get('/artists')
      .then(res => setArtists(res.data || []))
      .catch(() => setError('Failed to load artists'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = artists.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className='loading-indicator'>Loading artists...</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Gallery
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Title + search */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
              Artists
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
              {filtered.length} {filtered.length === 1 ? 'artist' : 'artists'}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              placeholder='Search by name...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '7px 14px 7px 34px', fontSize: '12px', width: '200px', outline: 'none', background: 'var(--white)', color: 'var(--dark)', fontFamily: "'Jost', sans-serif" }}
              onFocus={e => e.target.style.borderColor = 'var(--dark)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--muted)' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
          </div>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        {filtered.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--muted)' }}>No artists found</div>
          </div>
        )}

        {/* Artists grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(artist => (
            <div
              key={artist.id}
              onClick={() => navigate(`/artists/${artist.id}`)}
              style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--dark)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(63,37,55,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Avatar */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden', border: '2px solid var(--border)' }}>
                {artist.avatar
                  ? <img src={artist.avatar} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--dark)' }}>
                      {artist.name?.charAt(0).toUpperCase()}
                    </div>
                }
              </div>

              {/* Name */}
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '4px' }}>
                {artist.name}
              </div>

              {/* Works count */}
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: artist.bio ? '8px' : 0 }}>
                {artist.works_count || 0} works
              </div>

              {/* Bio preview */}
              {artist.bio && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginTop: '6px' }}>
                  {artist.bio.slice(0, 70)}{artist.bio.length > 70 ? '…' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArtistsList
