import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

function Wishlist() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    orderApi.get('/wishlist')
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (productId) => {
    try {
      await orderApi.delete(`/wishlist/${productId}`)
      setItems(items.filter(i => i.product_id !== productId))
    } catch { setError('Failed to remove item') }
  }

  const handleMoveToCart = async (item) => {
    try {
      await orderApi.post('/cart', {
        product_id: item.product_id,
        title:      item.title,
        artist:     item.artist,
        image:      item.image,
        price:      item.price,
        quantity:   1,
      })
      await orderApi.delete(`/wishlist/${item.product_id}`)
      setItems(items.filter(i => i.product_id !== item.product_id))
      navigate('/cart')
    } catch { setError('Failed to move to cart') }
  }

  if (loading) return <div className='loading-indicator'>Loading wishlist...</div>

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

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
            My Wishlist
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        {items.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Your wishlist is empty
            </div>
            <Link to='/gallery' style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', paddingBottom: '1px' }}>
              Browse Gallery
            </Link>
          </div>
        )}

        <div>
          {items.map(item => (
            <div key={item.product_id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>

              {/* Thumbnail */}
              <div
                onClick={() => navigate(`/gallery/${item.product_id}`)}
                style={{ width: '110px', height: '140px', background: 'var(--white)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }}
              >
                {item.image
                  ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '11px' }}>No image</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: '4px' }}>
                  {item.artist || 'Unknown artist'}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '6px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>
                  ${item.price}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', paddingTop: '4px' }}>
                <button
                  onClick={() => handleMoveToCart(item)}
                  style={{
                    padding: '9px 18px',
                    background: 'var(--dark)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    fontFamily: "'Jost', sans-serif",
                    whiteSpace: 'nowrap',
                  }}
                >
                  Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted)',
                    fontFamily: "'Jost', sans-serif",
                    textDecoration: 'underline',
                    textDecorationColor: 'var(--border)',
                  }}
                >
                  Remove
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wishlist
