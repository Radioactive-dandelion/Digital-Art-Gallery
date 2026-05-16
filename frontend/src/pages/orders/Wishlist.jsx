import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      await orderApi.post('/cart', { product_id: item.product_id, quantity: 1 })
      await orderApi.delete(`/wishlist/${item.product_id}`)
      setItems(items.filter(i => i.product_id !== item.product_id))
      navigate('/cart')
    } catch { setError('Failed to move to cart') }
  }

  if (loading) return <div className='loading-indicator'>Loading wishlist...</div>

  return (
    <div className='page'>
      <div className='content-header'>
        <span className='page-title'>My Wishlist</span>
        <span className='subtitle'>{items.length} items</span>
      </div>

      {error && <div className='status error'>{error}</div>}

      {items.length === 0 && !error && (
        <div className='status'>Your wishlist is empty. <a href='/gallery' className='external-link'>Browse Gallery</a></div>
      )}

      <div className='wishlist-list'>
        {items.map(item => (
          <div className='wishlist-item' key={item.product_id}>
            <div className='wishlist-thumb-wrap' onClick={() => navigate(`/gallery/${item.product_id}`)} style={{ cursor: 'pointer' }}>
              {item.image
                ? <img src={item.image} alt={item.title} className='wishlist-thumb-image' />
                : <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No image</div>
              }
            </div>
            <div className='wishlist-info'>
              <div className='product-brand'>{item.artist || 'Unknown artist'}</div>
              <div className='product-name'>{item.title}</div>
              <div className='product-price' style={{ marginTop: '0.25rem' }}>${item.price}</div>
            </div>
            <div className='wishlist-actions'>
              <button className='primary-button' style={{ marginTop: 0 }} onClick={() => handleMoveToCart(item)}>
                Move to Cart
              </button>
              <button className='external-link' style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => handleRemove(item.product_id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist
