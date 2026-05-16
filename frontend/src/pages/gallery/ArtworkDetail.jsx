import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi, orderApi } from '../../api/axios'

function ArtworkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artwork, setArtwork]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [cartMsg, setCartMsg]   = useState('')
  const isLoggedIn = !!localStorage.getItem('role')

  useEffect(() => {
    productApi.get(`/products/${id}`)
      .then(res => setArtwork(res.data))
      .catch(() => setError('Failed to load artwork'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/cart', { product_id: artwork.id, quantity: 1 })
      setCartMsg('Added to cart!')
      setTimeout(() => setCartMsg(''), 2000)
    } catch (err) {
      setCartMsg(err.response?.data?.error || 'Error adding to cart')
    }
  }

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/wishlist', { product_id: artwork.id })
      setCartMsg('Added to wishlist!')
      setTimeout(() => setCartMsg(''), 2000)
    } catch (err) {
      setCartMsg(err.response?.data?.error || 'Error adding to wishlist')
    }
  }

  if (loading) return <div className='loading-indicator'>Loading...</div>
  if (error)   return <div className='status error'>{error}</div>
  if (!artwork) return <div className='status'>Artwork not found</div>

  return (
    <div className='page'>
      <div style={{ marginBottom: '1rem' }}>
        <Link to='/gallery' className='external-link'>← Back to Gallery</Link>
      </div>

      <div className='fw-product-layout'>
        {/* Image */}
        <div className='fw-gallery'>
          <div className='fw-main-image-wrap'>
            {artwork.image
              ? <img src={artwork.image} alt={artwork.title} className='fw-main-image' />
              : <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No image</div>
            }
          </div>
        </div>

        {/* Info panel */}
        <div className='fw-detail-panel'>
          <div className='product-category-detail'>{artwork.category || 'Digital Art'}</div>
          <h2 className='product-title-detail'>{artwork.title}</h2>
          <div className='product-brand' style={{ marginTop: '0.3rem' }}>
            by{' '}
            <Link to={`/artists/${artwork.artist_id}`} style={{ color: 'inherit', borderBottom: '1px solid #ccc' }}>
              {artwork.artist || 'Unknown artist'}
            </Link>
          </div>
          <div className='product-price-detail' style={{ marginTop: '1rem' }}>${artwork.price}</div>

          {artwork.description && (
            <p className='product-description-detail'>{artwork.description}</p>
          )}

          {cartMsg && (
            <div className='profile-alert alert-success' style={{ marginTop: '0.5rem' }}>{cartMsg}</div>
          )}

          <button className='primary-button' style={{ width: '100%' }} onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className='primary-button'
            style={{ width: '100%', background: '#fff', color: '#111', marginTop: '0.5rem' }}
            onClick={handleAddToWishlist}>
            ♡ Save to Wishlist
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArtworkDetail
