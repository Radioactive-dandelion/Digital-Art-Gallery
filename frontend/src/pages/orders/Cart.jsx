import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/axios'

function Cart() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    orderApi.get('/cart')
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false))
  }, [])

  const handleQtyChange = async (productId, qty) => {
    if (qty < 1) return handleRemove(productId)
    try {
      await orderApi.put(`/cart/${productId}`, { quantity: qty })
      setItems(items.map(i => i.product_id === productId ? { ...i, quantity: qty } : i))
    } catch { setError('Failed to update quantity') }
  }

  const handleRemove = async (productId) => {
    try {
      await orderApi.delete(`/cart/${productId}`)
      setItems(items.filter(i => i.product_id !== productId))
    } catch { setError('Failed to remove item') }
  }

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  if (loading) return <div className='loading-indicator'>Loading cart...</div>

  return (
    <div className='page'>
      <div className='content-header'>
        <span className='page-title'>Shopping Cart</span>
        <span className='subtitle'>{items.length} items</span>
      </div>

      {error && <div className='status error'>{error}</div>}

      {items.length === 0 && !error && (
        <div className='status'>Your cart is empty. <a href='/gallery' className='external-link'>Browse Gallery</a></div>
      )}

      <div className='bag-list'>
        {items.map(item => (
          <div className='bag-item' key={item.product_id}>
            <div className='wishlist-thumb-wrap' onClick={() => navigate(`/gallery/${item.product_id}`)} style={{ cursor: 'pointer' }}>
              {item.image
                ? <img src={item.image} alt={item.title} className='wishlist-thumb-image' />
                : <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No image</div>
              }
            </div>
            <div className='wishlist-info'>
              <div className='product-brand'>{item.artist || 'Unknown artist'}</div>
              <div className='product-name'>{item.title}</div>
              <div className='product-price'>${item.price}</div>
            </div>
            <div className='bag-right'>
              <div className='qty-label'>
                Qty:
                <input
                  type='number' className='qty-input' min='1'
                  value={item.quantity}
                  onChange={e => handleQtyChange(item.product_id, parseInt(e.target.value))}
                />
              </div>
              <div className='line-total'>${(item.price * item.quantity).toFixed(2)}</div>
              <button className='external-link' style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => handleRemove(item.product_id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className='cart-total'>
          <strong>Total: ${total.toFixed(2)}</strong>
          <div style={{ marginTop: '1rem' }}>
            <button className='primary-button' onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
