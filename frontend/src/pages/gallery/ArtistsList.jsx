import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className='page'>
      <div className='content-header' style={{ marginBottom: '1.5rem' }}>
        <span className='page-title'>Artists</span>
        <input
          className='search-input'
          placeholder='Search by name...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className='status error'>{error}</div>}

      <div className='products-grid'>
        {filtered.map(artist => (
          <div
            key={artist.id}
            className='product-card'
            onClick={() => navigate(`/artists/${artist.id}`)}
          >
            <div className='product-image-wrap'>
              {artist.avatar
                ? <img src={artist.avatar} alt={artist.name} className='product-image' style={{ objectFit: 'cover' }} />
                : (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#f5f5f5',
                    fontSize: '2.5rem', color: '#bbb'
                  }}>
                    {artist.name?.charAt(0).toUpperCase()}
                  </div>
                )
              }
            </div>
            <div className='product-info'>
              <div className='product-name'>{artist.name}</div>
              <div className='product-brand'>{artist.works_count || 0} works</div>
              {artist.bio && (
                <div className='subtitle' style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  {artist.bio.slice(0, 80)}{artist.bio.length > 80 ? '…' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !error && (
        <div className='status'>No artists found</div>
      )}
    </div>
  )
}

export default ArtistsList
