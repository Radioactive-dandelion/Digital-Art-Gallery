import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi, orderApi } from '../../api/axios'

const PRODUCT_URL = 'http://localhost:8082'

function ArtworkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [toast, setToast]     = useState({ msg: '', type: 'success' })
  const isLoggedIn = !!localStorage.getItem('role')

  useEffect(() => {
    productApi.get(`/products/${id}`)
      .then(res => setArtwork(res.data))
      .catch(() => setError('Failed to load artwork'))
      .finally(() => setLoading(false))
  }, [id])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500)
  }

  const imageUrl = artwork?.image
    ? (artwork.image.startsWith('http') ? artwork.image : `${PRODUCT_URL}${artwork.image}`)
    : null

  const artistName = artwork?.artist_name || artwork?.artist || 'Unknown artist'

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/cart', {
        product_id: artwork.id,
        title:      artwork.title,
        artist:     artistName,
        image:      imageUrl,
        price:      artwork.price,
        quantity:   1,
      })
      showToast('Added to cart', 'success')
    } catch {
      showToast('Error adding to cart', 'error')
    }
  }

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/wishlist', {
        product_id: artwork.id,
        title:      artwork.title,
        artist:     artistName,
        image:      imageUrl,
        price:      artwork.price,
      })
      showToast('Saved to wishlist', 'success')
    } catch {
      showToast('Error adding to wishlist', 'error')
    }
  }

  if (loading) return <div className='loading-indicator'>Loading...</div>
  if (error)   return <div className='status error'>{error}</div>
  if (!artwork) return <div className='status'>Artwork not found</div>

  const toastBg    = toast.type === 'success' ? '#e8f5e9' : '#fce4ec'
  const toastColor = toast.type === 'success' ? '#1b5e20' : '#880e4f'
  const toastBorder = toast.type === 'success' ? '#c8e6c9' : '#f8bbd0'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif", color: 'var(--dark)' }}>

      {/* Mini header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Gallery
        </Link>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{ textAlign: 'center', padding: '9px', background: toastBg, fontSize: '12px', color: toastColor, letterSpacing: '0.08em', borderBottom: `1px solid ${toastBorder}` }}>
          {toast.msg}
        </div>
      )}

      {/* Layout */}
      <div style={{ display: 'flex', gap: '4rem', padding: '3rem 4vw', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Image */}
        <div style={{ flex: '1.2', maxWidth: '520px' }}>
          <div style={{ position: 'relative', paddingTop: '125%', background: 'var(--white)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {imageUrl
              ? <img src={imageUrl} alt={artwork.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>No Image</div>
            }
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, maxWidth: '380px', paddingTop: '1rem' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--muted)', marginBottom: '8px' }}>
            {artwork.category || 'Digital Art'}
            {artwork.medium && ` · ${artwork.medium}`}
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', lineHeight: 1.2, marginBottom: '10px' }}>
            {artwork.title}
          </h1>

          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '1.2rem' }}>
            by{' '}
            <Link to={`/artists/${artwork.artist_id}`} style={{ color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>
              {artistName}
            </Link>
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '1.5rem' }}>
            ${artwork.price}
          </div>

          {artwork.description && (
            <p style={{ fontSize: '13px', color: '#6a5060', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {artwork.description}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            style={{ width: '100%', padding: '13px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: "'Jost', sans-serif", marginBottom: '10px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#5a3550'}
            onMouseLeave={e => e.target.style.background = 'var(--dark)'}
          >
            Add to Cart
          </button>

          <button
            onClick={handleAddToWishlist}
            style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--dark)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: "'Jost', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
            </svg>
            Save to Wishlist
          </button>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {artwork.medium   && <div><span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Medium</span> · {artwork.medium}</div>}
            {artwork.category && <div><span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Category</span> · {artwork.category}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkDetail
