import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/axios'

const STATUS_COLORS = {
  pending:    '#b85c00',
  confirmed:  '#185fa5',
  shipped:    '#0f6e56',
  delivered:  '#3b6d11',
  cancelled:  '#a32d2d',
}

function OrderHistory() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    orderApi.get('/orders')
      .then(res => setOrders(res.data || []))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className='loading-indicator'>Loading orders...</div>

  return (
    <div className='page'>
      <div className='content-header'>
        <span className='page-title'>My Orders</span>
        <span className='subtitle'>{orders.length} orders</span>
      </div>

      {error && <div className='status error'>{error}</div>}

      {orders.length === 0 && !error && (
        <div className='status'>No orders yet. <a href='/gallery' className='external-link'>Browse Gallery</a></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => (
          <div key={order.id} className='profile-card' style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/orders/${order.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className='product-name'>Order #{order.id}</div>
                <div className='product-brand' style={{ marginTop: '0.25rem' }}>
                  {new Date(order.created_at).toLocaleDateString()} · {order.items_count || 0} items
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className='product-price'>${Number(order.total).toFixed(2)}</div>
                <div style={{
                  marginTop: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: STATUS_COLORS[order.status] || '#666'
                }}>
                  {order.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderHistory
