import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productApi } from '../../api/axios'

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
    <div className='page'>
      {/* Artist header */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
        <div>
          {artist.avatar
            ? <img src={artist.avatar} alt={artist.name} style={{ width: 120, height: 120, objectFit: 'cover', border: '1px solid #eee' }} />
            : (
              <div style={{ width: 120, height: 120, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#bbb' }}>
                {artist.name?.charAt(0)}
              </div>
            )
          }
        </div>
        <div>
          <div className='product-brand' style={{ marginBottom: '0.25rem' }}>Artist</div>
          <h2 style={{ fontWeight: 400, fontSize: '1.8rem', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>{artist.name}</h2>
          {artist.bio && <p style={{ color: '#555', maxWidth: 500, lineHeight: 1.6 }}>{artist.bio}</p>}
          <div className='subtitle' style={{ marginTop: '0.75rem' }}>{works.length} works available</div>
        </div>
      </div>

      {/* Works grid */}
      <div className='content-header'>
        <span className='page-title'>Works</span>
      </div>
      <div className='products-grid' style={{ marginTop: '1rem' }}>
        {works.map(work => (
          <div className='product-card' key={work.id} onClick={() => navigate(`/gallery/${work.id}`)}>
            <div className='product-image-wrap'>
              {work.image
                ? <img src={work.image} alt={work.title} className='product-image' />
                : <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.8rem' }}>No image</div>
              }
            </div>
            <div className='product-info'>
              <div className='product-name'>{work.title}</div>
              <div className='product-price'>${work.price}</div>
            </div>
          </div>
        ))}
      </div>

      {works.length === 0 && (
        <div className='status'>This artist hasn't uploaded any works yet.</div>
      )}
    </div>
  )
}

export default ArtistProfile
