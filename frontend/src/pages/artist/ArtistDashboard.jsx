import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productApi, userApi } from '../../api/axios'

function ArtistDashboard() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  useEffect(() => {
    productApi.get('/artist/products')
      .then(res => setArtworks(res.data || []))
      .catch(() => setError('Failed to load artworks'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artwork?')) return
    try {
      await productApi.delete(`/products/${id}`)
      setArtworks(artworks.filter(a => a.id !== id))
    } catch { setError('Failed to delete artwork') }
  }

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/gallery')
  }

  return (
    <div className='dash-page'>

      {/* Header */}
      <div className='dash-header'>
        <Link to='/gallery' className='dash-header-logo'>DigitalArt</Link>
        <div className='dash-header-nav'>
          <Link to='/gallery'>Gallery</Link>
          <Link to='/artist' className='active'>My Works</Link>
          <Link to='/artist/earnings'>Earnings</Link>
          <Link to='/profile'>Profile</Link>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div className='dash-content'>
        <div className='dash-title'>Artist Dashboard</div>
        <div className='dash-subtitle'>Welcome back{name ? `, ${name}` : ''} · Manage your artworks</div>

        {/* Stats */}
        <div className='stat-grid'>
          <div className='stat-card'>
            <div className='stat-card-value'>{artworks.length}</div>
            <div className='stat-card-label'>Total Works</div>
          </div>
          <div className='stat-card'>
            <div className='stat-card-value'>{artworks.filter(a => a.is_active).length}</div>
            <div className='stat-card-label'>Active</div>
          </div>
          <div className='stat-card'>
            <div className='stat-card-value'>
              {artworks.length > 0
                ? `$${Math.min(...artworks.map(a => a.price))} – $${Math.max(...artworks.map(a => a.price))}`
                : '—'}
            </div>
            <div className='stat-card-label'>Price Range</div>
          </div>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className='dash-section-title' style={{ margin: 0, border: 'none', padding: 0 }}>My Artworks</div>
          <button className='btn-primary' onClick={() => navigate('/artist/upload')}>
            + Upload New Artwork
          </button>
        </div>

        {loading && <div className='loading'>Loading your artworks...</div>}

        {!loading && artworks.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              No artworks yet
            </div>
            <button className='btn-primary' onClick={() => navigate('/artist/upload')}>
              Upload Your First Work
            </button>
          </div>
        )}

        {artworks.length > 0 && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className='dash-table'>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Preview</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map(art => (
                  <tr key={art.id}>
                    <td>
                      <div style={{ width: '44px', height: '55px', background: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {art.image
                          ? <img src={`http://localhost:8082${art.image}`} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '10px' }}>—</div>
                        }
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--dark)' }}>{art.title}</div>
                      {art.description && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{art.description.slice(0, 50)}{art.description.length > 50 ? '…' : ''}</div>}
                    </td>
                    <td style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>
                      {art.category || '—'}
                    </td>
                    <td style={{ fontWeight: 500 }}>${art.price}</td>
                    <td>
                      <span className={`badge ${art.is_active ? 'badge-artist' : 'badge-buyer'}`}>
                        {art.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className='btn-edit' onClick={() => navigate(`/artist/edit/${art.id}`)}>Edit</button>
                      <button className='btn-danger' onClick={() => handleDelete(art.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistDashboard
