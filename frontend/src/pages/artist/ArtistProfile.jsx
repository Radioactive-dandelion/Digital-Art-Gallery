import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi } from '../../api/axios'

const PRODUCT_URL = 'http://localhost:8082'

function ArtistProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist]   = useState(null)
  const [works, setWorks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    Promise.all([
      productApi.get(`/artists/${id}`),
      productApi.get(`/artists/${id}/products`),
    ])
      .then(([artistRes, worksRes]) => {
        setArtist(artistRes.data)
        setWorks(worksRes.data || [])
      })
      .catch(() => setError('Failed to load artist'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className='loading-indicator'>Loading artist...</div>
  if (error)   return <div className='status error'>{error}</div>
  if (!artist) return <div className='status'>Artist not found</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/artists' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← All Artists
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Artist bio section */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          {/* Avatar */}
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
            {artist.avatar
              ? <img src={artist.avatar} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', color: 'var(--dark)' }}>
                  {artist.name?.charAt(0)}
                </div>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: '6px' }}>
              Artist
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '8px' }}>
              {artist.name}
            </h1>
            {artist.bio && (
              <p style={{ fontSize: '13px', color: '#6a5060', lineHeight: 1.7, maxWidth: '500px', marginBottom: '10px' }}>
                {artist.bio}
              </p>
            )}
            <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
              {works.length} {works.length === 1 ? 'work' : 'works'} available
            </div>
          </div>
        </div>

        {/* Works */}
        <div style={{ marginBottom: '1.2rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 400, color: 'var(--dark)' }}>
            Works
          </h2>
        </div>

        {works.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--muted)' }}>
            No works uploaded yet
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '2rem' }}>
          {works.map(work => (
            <div key={work.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/gallery/${work.id}`)}>
              <div style={{ position: 'relative', paddingTop: '128%', background: 'var(--white)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(63,37,55,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {work.image
                  ? <img src={work.image.startsWith('http') ? work.image : `${PRODUCT_URL}${work.image}`} alt={work.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: "'Cormorant Garamond', serif" }}>No Image</div>
                }
              </div>
              <div style={{ padding: '10px 2px 0' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--dark)', marginBottom: '3px' }}>{work.title}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dark)' }}>${work.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArtistProfile
