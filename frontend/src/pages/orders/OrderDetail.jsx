import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    orderApi.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className='loading-indicator'>Loading order...</div>
  if (error)   return <div className='status error'>{error}</div>
  if (!order)  return <div className='status'>Order not found</div>

  return (
    <div className='page'>
      <div style={{ marginBottom: '1rem' }}>
        <Link to='/orders' className='external-link'>← Back to Orders</Link>
      </div>

      <div className='profile-header' style={{ marginBottom: '1.5rem' }}>
        <h2>Order #{order.id}</h2>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#777' }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Items */}
        <div className='profile-card'>
          <h6>Items</h6>
          {(order.items || []).map(item => (
            <div key={item.product_id} className='wishlist-item'>
              <div className='wishlist-thumb-wrap'>
                {item.image
                  ? <img src={item.image} alt={item.title} className='wishlist-thumb-image' />
                  : <div style={{ color: '#aaa', fontSize: '0.8rem' }}>No image</div>
                }
              </div>
              <div className='wishlist-info'>
                <div className='product-brand'>{item.artist}</div>
                <div className='product-name'>{item.title}</div>
              </div>
              <div className='wishlist-actions'>
                <div className='product-price'>${(item.price * item.quantity).toFixed(2)}</div>
                <div className='product-brand'>Qty: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className='profile-card'>
            <h6>Summary</h6>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777' }}>Date</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#777' }}>Status</span>
                <span style={{ textTransform: 'capitalize' }}>{order.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.shipping && (
            <div className='profile-card' style={{ marginTop: '1rem' }}>
              <h6>Shipping</h6>
              <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                <div>{order.shipping.full_name}</div>
                <div>{order.shipping.address}</div>
                <div>{order.shipping.city}, {order.shipping.country} {order.shipping.zip}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
